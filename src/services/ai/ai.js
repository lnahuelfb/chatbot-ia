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

    // Traer historial desde DB
    const messages = await prisma.message.findMany({
      where: { conversationId: String(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    // Construir history para el modelo
    const history = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    // Llamada a OpenAI con herramientas
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: history,
      tools: functions,
    });

    // Log para depuración
    console.log("Response output:", response.output);
    console.log("Response text:", response.output_text);

    // 1️⃣ Procesar TODOS los tool calls
    if (Array.isArray(response.output)) {
      const toolCalls = response.output.filter(o =>
        ["tool", "function_call", "tool_call"].includes(o.type)
      );

      if (toolCalls.length > 0) {
        let lastReply;
        for (const toolBlock of toolCalls) {
          let fnName, argsRaw;

          if (toolBlock.type === "function_call") {
            fnName = toolBlock.name;
            argsRaw = toolBlock.arguments || "{}"; // 🔑 acá parseamos directamente
          } else if (toolBlock.tool) {
            fnName = toolBlock.tool.name;
            argsRaw = toolBlock.tool.input || toolBlock.tool.arguments || "{}";
          } else {
            fnName = toolBlock.name;
            argsRaw = toolBlock.input || "{}";
          }

          let args;
          try {
            args = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
          } catch {
            args = {};
          }

          console.log("fnName:", fnName, "args:", args);

          lastReply = await handleFunctionCall({ name: fnName, args }, history, conversationId);
        }

        return lastReply;
      }
    }

    // 2️⃣ Si no hubo tool call, usamos texto
    if (response.output_text?.trim()) {
      const text = response.output_text.trim();
      await prisma.message.create({
        data: {
          role: "assistant",
          content: text,
          conversationId: String(conversationId),
        },
      });
      return text;
    }

    // 3️⃣ Fallback genérico
    const fallback =
      "Podemos avanzar filtrando por zona o características. ¿Qué preferís definir primero?";
    await prisma.message.create({
      data: {
        role: "assistant",
        content: fallback,
        conversationId: String(conversationId),
      },
    });
    return fallback;
  } catch (err) {
    console.error("Error IA:", err?.message || err);
    return "Estoy teniendo un problema técnico, ya lo reviso.";
  }
}
