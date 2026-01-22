import "dotenv/config";
import OpenAI from "openai";
import { prisma } from "../../db/prisma.js";
import { functions } from "./functions.js";
import { handleFunctionCall } from "./handlers.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateReply(conversationId, userMessage) {
  try {
    if (!conversationId || !userMessage) return "¿Podés repetir eso?";

    // 1️⃣ Traer historial desde DB
    const messages = await prisma.message.findMany({
      where: { conversationId: String(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    // Convertir a formato que OpenAI espera
    const history = [{ role: "system", content: SYSTEM_PROMPT }, ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content, })), { role: "user", content: userMessage },];

    // 3️⃣ Llamada a OpenAI con herramientas
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: history,
      tools: functions,
    });

    const text = response.output_text?.trim();
    if (text) {
      // Guardar respuesta en DB
      await prisma.message.create({
        data: {
          role: "assistant",
          content: text,
          conversationId: String(conversationId),
        },
      });
      return text;
    }

    // 4️⃣ Manejo de tool/function_call si no hay texto
    const toolBlock = Array.isArray(response.output)
      ? response.output.find(o => ["tool", "function_call", "tool_call"].includes(o.type))
      : null;

    if (toolBlock) {
      let fnName, argsRaw;
      if (toolBlock.tool) {
        fnName = toolBlock.tool.name;
        argsRaw = toolBlock.tool.input || toolBlock.tool.arguments || "{}";
      } else if (toolBlock.function_call) {
        fnName = toolBlock.function_call.name;
        argsRaw = toolBlock.function_call.arguments || "{}";
      } else {
        fnName = toolBlock.name;
        argsRaw = toolBlock.input || "{}";
      }

      let args;
      try { args = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw; }
      catch { args = {}; }

      return await handleFunctionCall({ name: fnName, args }, history);
    }

    // 5️⃣ Fallback genérico
    const fallback = "Podemos avanzar filtrando por zona o características. ¿Qué preferís definir primero?";
    await prisma.message.create({
      data: { role: "assistant", content: fallback, conversationId: String(conversationId) },
    });
    return fallback;

  } catch (err) {
    console.error("Error IA:", err?.message || err);
    return "Estoy teniendo un problema técnico, ya lo reviso.";
  }
}
