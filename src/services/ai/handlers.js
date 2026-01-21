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
      
      // Usamos upsert: si el usuario no tiene preferencias, las crea; si tiene, las pisa.
      await prisma.userPreference.upsert({
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
      
      console.log(`[DB] Preferencias guardadas con éxito.`);
    } catch (err) {
      // Si falla Prisma, logueamos pero no cortamos el chat
      console.error("[DB ERROR] Error al usar Prisma:", err);
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
  return await prisma.property.findMany({
    where: {
      AND: [
        filtros.zona ? { zona: { contains: filtros.zona, mode: 'insensitive' } } : {},
        filtros.recamaras ? { recamaras: { gte: filtros.recamaras } } : {},
        filtros.presupuestoMax ? { precio: { lte: filtros.presupuestoMax } } : {},
      ]
    },
    take: 5 // Para no saturar el chat de Telegram
  });
}

// import {prisma} from '../../db/prisma'

// export async function filtrarPropiedades({ zona, recamaras, presupuestoMax }) {
//   const allProps = [
//     { titulo: "Casa en Coyoacán", zona: "Coyoacán", precio: 5000000, recamaras: 3 },
//     { titulo: "Departamento en Coyoacán", zona: "Coyoacán", precio: 3200000, recamaras: 2 },
//     { titulo: "Casa en Polanco", zona: "Polanco", precio: 12000000, recamaras: 4 },
//     { titulo: "Departamento en Roma", zona: "Roma", precio: 4500000, recamaras: 2 },
//   ];

//   return allProps.filter(p =>
//     (!zona || p.zona.toLowerCase() === zona.toLowerCase()) &&
//     (!recamaras || p.recamaras === recamaras) &&
//     (!presupuestoMax || p.precio <= presupuestoMax)
//   );
// }

// export function parseUserMessage(message) {
//   const recamarasMatch = message.match(/(\d+)\s*recámaras?/i);
//   const presupuestoMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(millones|mxn|pesos)/i);

//   return {
//     recamaras: recamarasMatch ? Number(recamarasMatch[1]) : undefined,
//     presupuestoMax: presupuestoMatch
//       ? Number(presupuestoMatch[1].replace(',', '.')) * 1_000_000
//       : undefined
//   };
// }

// export function parseZona(message) {
//   const zonas = ["Coyoacán", "Polanco", "Condesa", "Roma", "Narvarte", "Escandón"];
//   for (const zona of zonas) {
//     if (message.toLowerCase().includes(zona.toLowerCase())) return zona;
//   }
//   return undefined;
// }

// // handlers.js
// export async function handleFunctionCall(fnNameOrFilters, history) {
//   if (fnNameOrFilters?.name === "updatePreferences") {
//     const { userId, ...payload } = fnNameOrFilters.args;

//     try {
//       const resp = await fetch(`${process.env.API_URL}/api/users/${userId}/preferences`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!resp.ok) {
//         throw new Error(`Error API: ${resp.status} ${resp.statusText}`);
//       }

//       const preference = await resp.json();

//       const reply = `Perfecto, ya guardé tus preferencias: zona=${preference.zona ?? "-"}, recámaras=${preference.recamaras ?? "-"}, presupuesto=${preference.presupuestoMax ?? "-"}, operación=${preference.operacion ?? "-"}. ¿Querés que te muestre opciones que encajen con eso?`;

//       history.push({ role: "assistant", content: reply });
//       return reply;
//     } catch (err) {
//       console.error("Error guardando preferencias vía API:", err);
//       const reply = "No pude guardar tus preferencias en este momento. Probemos de nuevo más tarde.";
//       history.push({ role: "assistant", content: reply });
//       return reply;
//     }
//   }

//   // resto igual: filtros de propiedades
//   const filtros = fnNameOrFilters;
//   const resultados = await filtrarPropiedades(filtros);

//   history.push({
//     role: "developer",
//     content: JSON.stringify({ filtros, resultados }),
//   });

//   const reply = resultados.length
//     ? `Tengo opciones que cumplen lo que buscas: ${resultados.map(r => `${r.titulo} por ${r.precio} MXN`).join(" | ")}. ¿Querés que afinemos algún filtro más?`
//     : "No encontré propiedades con esos filtros. ¿Querés probar con otros parámetros?";

//   history.push({ role: "assistant", content: reply });
//   return reply;
// }

