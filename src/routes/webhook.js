import { Router } from "express";
import { generateReply } from "../services/ai/ai.js";
import { sendMessage } from "../services/chatwoot/chatwoot.js";

const router = Router();

router.get("/", (_req, res) => {
  res.send({message: "El webhook está funcionando correctamente."});
});

router.post("/", async (req, res) => {
  const conversationId = req.body?.conversation?.id || req.body?.conversation_id;
  const lastMessage = req.body?.conversation?.messages?.[0]?.content;
  const messageType = req.body.message_type;

  res.sendStatus(200);

  if (!conversationId || messageType !== "incoming") return;

  console.log("Mensaje recibido:", { message: req.body?.conversation?.messages?.[0].content, conversationId });

  const aiReply = await generateReply(conversationId, lastMessage);
  await sendMessage(conversationId, aiReply);

  console.log("Respuesta enviada:", aiReply);
});

export default router;