import { prisma } from "../../db/prisma.js";

export async function handleFunctionCall(fnNameOrFilters, history, conversationId) {
  const isUpdate = fnNameOrFilters?.name === "updatePreferences";
  console.log("fnNameOrFilters: ", fnNameOrFilters)
  let args = isUpdate ? fnNameOrFilters.args : fnNameOrFilters;

  // 🔑 Forzar parseo si viene como string o si es un objeto vacío
  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      args = {};
    }
  } else if (args && typeof args.arguments === "string") {
    // Caso: te llega un objeto con la propiedad arguments como string
    try {
      args = JSON.parse(args.arguments);
    } catch {
      args = {};
    }
  }

  console.log("Args finales:", args);

  if (isUpdate) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: String(conversationId) },
        include: { user: true },
      });

      if (!conversation?.user) {
        const reply = "No encontré el usuario asociado a esta conversación.";
        history.push({ role: "assistant", content: reply });
        return reply;
      }

      const userId = conversation.user.id;

      const preferences = await prisma.preference.upsert({
        where: { userId },
        update: {
          zona: args.zona,
          tipoPropiedad: args.tipoPropiedad,
          recamaras: args.recamaras,
          presupuestoMax: args.presupuestoMax,
          operacion: args.operacion,
          profileCompleted: Boolean(
            args.zona && args.tipoPropiedad && args.recamaras && args.presupuestoMax && args.operacion
          ),
        },
        create: {
          userId,
          zona: args.zona,
          tipoPropiedad: args.tipoPropiedad,
          recamaras: args.recamaras,
          presupuestoMax: args.presupuestoMax,
          operacion: args.operacion,
          profileCompleted: false,
        },
      });

      const reply = `¡Listo! Guardé tus preferencias: zona=${preferences.zona ?? "-"}, tipo=${preferences.tipoPropiedad ?? "-"}, recámaras=${preferences.recamaras ?? "-"}, presupuesto=${preferences.presupuestoMax ?? "-"}, operación=${preferences.operacion ?? "-"}.`;
      history.push({ role: "assistant", content: reply });
      return reply;
    } catch (err) {
      console.error("[DB ERROR] Error al guardar preferencias:", err);
      const reply = "No pude guardar tus preferencias en este momento. Probemos más tarde.";
      history.push({ role: "assistant", content: reply });
      return reply;
    }
  }

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
