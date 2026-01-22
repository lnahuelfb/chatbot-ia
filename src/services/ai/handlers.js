import { prisma } from "../../db/prisma.js";

export async function handleFunctionCall(fnNameOrFilters, history) {
  const isUpdate = fnNameOrFilters?.name === "updatePreferences";
  const args = isUpdate ? fnNameOrFilters.args : fnNameOrFilters;

  console.log('Args: ', args)
  console.log('IsUpdate: ', isUpdate)
  console.log('History: ', history)


  if (isUpdate) {
    try {
      // Paso intermedio: buscar la conversación y obtener el userId real
      const conversation = await prisma.conversation.findUnique({
        where: { id: String(args.conversationId) },
        include: { user: true },
      });

      console.log(conversation)

      if (!conversation?.user) {
        const reply = "No encontré el usuario asociado a esta conversación.";
        history.push({ role: "assistant", content: reply });
        return reply;
      }

      const userId = conversation.user.id;

      // Guardar/actualizar preferencias
      const preferences = await prisma.preference.upsert({
        where: { userId },
        update: {
          zona: args.zona,
          recamaras: args.recamaras,
          presupuestoMax: args.presupuestoMax,
          operacion: args.operacion,
        },
        create: {
          userId,
          zona: args.zona,
          recamaras: args.recamaras,
          presupuestoMax: args.presupuestoMax,
          operacion: args.operacion,
        },
      });

      const reply = `¡Listo! Guardé tus preferencias: zona=${preferences.zona ?? "-"}, recámaras=${preferences.recamaras ?? "-"}, presupuesto=${preferences.presupuestoMax ?? "-"}, operación=${preferences.operacion ?? "-"}.`;
      history.push({ role: "assistant", content: reply });
      return reply;
    } catch (err) {
      console.error("[DB ERROR] Error al guardar preferencias:", err);
      const reply = "No pude guardar tus preferencias en este momento. Probemos más tarde.";
      history.push({ role: "assistant", content: reply });
      return reply;
    }
  }

  // Si no es updatePreferences, buscás propiedades con filtros
  const resultados = await filtrarPropiedadesDesdeDB(args);

  const reply = resultados.length
    ? `Tengo estas opciones: ${resultados.map(r => `${r.titulo} ($${r.precio})`).join(" | ")}`
    : "No tengo nada justo ahora con esos filtros, pero ya los guardé para avisarte apenas entre algo.";

  history.push({ role: "assistant", content: reply });
  return reply;
}

async function filtrarPropiedadesDesdeDB(filtros) {
  const where = {};
  if (filtros.zona) where.zona = { contains: filtros.zona, mode: "insensitive" };
  if (filtros.recamaras) where.recamaras = { gte: filtros.recamaras };
  if (filtros.presupuestoMax) where.precio = { lte: filtros.presupuestoMax };

  return await prisma.property.findMany({ where, take: 5 });
}
