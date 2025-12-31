import "dotenv/config";
import OpenAI from "openai";
import { functions } from "./functions.js";
import { handleFunctionCall, parseUserMessage, parseZona } from "./handlers.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const conversations = {};

export async function generateReply(conversationId, userMessage) {
  try {
    if (!conversationId || !userMessage) return "¿Podés repetir eso?";

    if (!conversations[conversationId]) {
      conversations[conversationId] = [{ role: "system", content: SYSTEM_PROMPT }];
    }

    const history = conversations[conversationId];
    history.push({ role: "user", content: userMessage });

    const featuresParams = parseUserMessage(userMessage);
    const zona = parseZona(userMessage);
    const filters = { ...featuresParams, zona };

    if (filters.recamaras || filters.presupuestoMax || filters.zona) {
      return await handleFunctionCall(filters, history, client);
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: history,
      tools: functions,
    });

    const fnCallBlock = response.output.find(o => o.type === "tool");
    if (fnCallBlock) {
      const fnName = fnCallBlock.tool.name;
      const args = JSON.parse(fnCallBlock.tool.input || "{}");
      return await handleFunctionCall(args, history, client);
    }

    const reply = response.output_text?.trim() ||
      "Podemos avanzar filtrando por zona o características. ¿Qué preferís definir primero?";

    history.push({ role: "assistant", content: reply });
    return reply;

  } catch (err) {
    console.error("Error IA:", err?.message || err);
    return "Estoy teniendo un problema técnico, ya lo reviso.";
  }
};
