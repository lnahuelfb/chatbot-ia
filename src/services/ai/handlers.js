import { prisma } from '../../db/prisma.js';

export async function handleFunctionCall(fnNameOrFilters, history) {
  // 1. Identificar si es una llamada a función o filtros directos
  const isUpdate = fnNameOrFilters?.name === "updatePreferences";
  const args = isUpdate ? fnNameOrFilters.args : fnNameOrFilters;
  
  // 2. Persistencia Real con Prisma
  // El userId viene de la IA (inyectado en el system prompt) o del mensaje
  if (args.userId) {
    try {
      console.log(`[DB] Sincronizando preferencias para: ${args.userId}`);
      
      console.log('Guardando preferencias')
      // Usamos upsert: si el usuario no tiene preferencias, las crea; si tiene, las pisa.
      const preferences = await prisma.preference.upsert({
        where: { userId: String(args.userId) },
        update: {
          zona: args.zona,
          recamaras: args.recamaras,
          presupuestoMax: args.presupuestoMax,
          operacion: args.operacion,
        },
        create: {
          userId: String(args.userId),
          zona: args.zona,
          recamaras: args.recamaras,
          presupuestoMax: args.presupuestoMax,
          operacion: args.operacion,
        },
      });

      if(preferences) {
        console.log("preferencias: ", args)
      }
      
      console.log(`[DB] Preferencias guardadas con éxito.`);
    } catch (err) {
      // Si falla Prisma, logueamos y devolvemos el error al usuario
      console.error("[DB ERROR] Error al usar Prisma:", err);
      const reply = "No pude guardar tus preferencias en este momento. Probemos de nuevo más tarde.";
      history.push({ role: "assistant", content: reply });
      return reply;
    }
  }

  // 3. Lógica de Respuesta
  if (isUpdate) {
    const reply = `¡Listo Nahuel! Ya guardé que buscás en ${args.zona || 'cualquier zona'} con un presupuesto de hasta ${args.presupuestoMax || 'lo que sea'}. ¿Te muestro lo que encontré?`;
    history.push({ role: "assistant", content: reply });
    return reply;
  }

  // Si son filtros, buscamos en la DB de propiedades (no en el array fijo)
  const resultados = await filtrarPropiedadesDesdeDB(args);

  const reply = resultados.length
    ? `Tengo estas opciones: ${resultados.map(r => `${r.titulo} ($${r.precio})`).join(" | ")}`
    : "No tengo nada justo ahora con esos filtros, pero ya los guardé para avisarte apenas entre algo.";

  history.push({ role: "assistant", content: reply });
  return reply;
}

// Función auxiliar para buscar de verdad en la base de datos
async function filtrarPropiedadesDesdeDB(filtros) {
  console.log('Filtros recibidos:', filtros);
  
  if (!filtros || (typeof filtros !== 'object' && filtros !== null)) {
    console.error('Los filtros no son un objeto válido');
    return [];
  }

  const where = {};

  if (filtros.zona) {
    where.zona = { contains: filtros.zona, mode: 'insensitive' };
  }

  if (filtros.recamaras) {
    where.recamaras = { gte: filtros.recamaras };
  }

  if (filtros.presupuestoMax) {
    where.precio = { lte: filtros.presupuestoMax };
  }

  return await prisma.property.findMany({
    where,
    take: 5 // Para no saturar el chat de Telegram
  });
}
