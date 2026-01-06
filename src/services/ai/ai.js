import "dotenv/config";
import OpenAI from "openai";
import { functions } from "./functions.js";
import { handleFunctionCall, parseUserMessage, parseZona } from "./handlers.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mantener solo ventana de contexto en memoria
const conversationContexts = {};

/**
 * Genera respuesta de la IA o llama a funciones de filtrado
 * @param {string} conversationId
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
export async function generateReply(conversationId, userMessage) {
  try {
    if (!conversationId || !userMessage) return "¿Podés repetir eso?";

    // Ventana de contexto en memoria
    if (!conversationContexts[conversationId]) {
      conversationContexts[conversationId] = [
        { role: "system", content: SYSTEM_PROMPT }
      ];
    }

    const history = conversationContexts[conversationId];

    // Agregar mensaje del usuario a la ventana de contexto
    history.push({ role: "user", content: userMessage });

    // Extraer filtros
    const featuresParams = parseUserMessage(userMessage);
    const zona = parseZona(userMessage);
    const filters = { ...featuresParams, zona };

    // Si hay filtros, llamamos a handler de funciones
    if (filters.recamaras || filters.presupuestoMax || filters.zona) {
      const reply = await handleFunctionCall(filters, history);
      history.push({ role: "assistant", content: reply });
      return reply;
    }

    // Si no hay filtros, llamamos a OpenAI
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: history,
      tools: functions,
    });

    // Detectar si la IA quiere llamar una función
    const fnCallBlock = response.output.find(o => o.type === "tool");
    if (fnCallBlock) {
      const fnName = fnCallBlock.tool.name;
      const args = JSON.parse(fnCallBlock.tool.input || "{}");
      const reply = await handleFunctionCall(args, history);
      history.push({ role: "assistant", content: reply });
      return reply;
    }

    const reply = response.output_text?.trim() ||
      "Podemos avanzar filtrando por zona o características. ¿Qué preferís definir primero?";

    history.push({ role: "assistant", content: reply });
    return reply;

  } catch (err) {
    console.error("Error IA:", err?.message || err);
    return "Estoy teniendo un problema técnico, ya lo reviso.";
  }
}


// import "dotenv/config";
// import OpenAI from "openai";
// import { functions } from "./functions.js";
// import { handleFunctionCall, parseUserMessage, parseZona } from "./handlers.js";
// import { SYSTEM_PROMPT } from "./prompts.js";

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const conversations = {};

// export async function generateReply(conversationId, userMessage) {
//   try {
//     if (!conversationId || !userMessage) return "¿Podés repetir eso?";

//     if (!conversations[conversationId]) {
//       conversations[conversationId] = [{ role: "system", content: SYSTEM_PROMPT }];
//     }

//     const history = conversations[conversationId];
//     history.push({ role: "user", content: userMessage });

//     const featuresParams = parseUserMessage(userMessage);
//     const zona = parseZona(userMessage);
//     const filters = { ...featuresParams, zona };

//     if (filters.recamaras || filters.presupuestoMax || filters.zona) {
//       return await handleFunctionCall(filters, history, client);
//     }

//     const response = await client.responses.create({
//       model: "gpt-4o-mini",
//       input: history,
//       tools: functions,
//     });

//     const fnCallBlock = response.output.find(o => o.type === "tool");
//     if (fnCallBlock) {
//       const fnName = fnCallBlock.tool.name;
//       const args = JSON.parse(fnCallBlock.tool.input || "{}");
//       return await handleFunctionCall(args, history, client);
//     }

//     const reply = response.output_text?.trim() ||
//       "Podemos avanzar filtrando por zona o características. ¿Qué preferís definir primero?";

//     history.push({ role: "assistant", content: reply });
//     return reply;

//   } catch (err) {
//     console.error("Error IA:", err?.message || err);
//     return "Estoy teniendo un problema técnico, ya lo reviso.";
//   }
// };
