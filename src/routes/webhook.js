// src/routes/webhook.js
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { generateReply } from "../services/ai/ai.js";
import { sendMessage } from "../services/chatwoot/chatwoot.js";

const router = Router();

function isIncoming(payload) {
  const msg = payload?.messages?.[0];
  if (!msg) return false;
  const mt = payload?.message_type ?? msg?.message_type;
  if (typeof mt === "string") return mt.toLowerCase() === "incoming";
  if (typeof mt === "number") return mt === 0;
  return msg?.sender_type?.toLowerCase?.() === "contact";
}

router.post("/", async (req, res) => {
  const payload = req.body;
  console.log("Webhook recibido:", payload?.event ?? "sin event", { id: payload?.id });


  res.sendStatus(200);

  try {
    if (!isIncoming(payload)) return;

    const conversationId =
      payload?.conversation?.id ||
      payload?.conversation_id ||
      payload?.id ||
      payload?.messages?.[0]?.conversation_id;

    const lastMessage =
      payload?.conversation?.messages?.[0]?.content ||
      payload?.messages?.[0]?.content ||
      payload?.message;

    if (!conversationId || !lastMessage) return;

    // asegurar contacto/usuario
    const contact = payload?.meta?.sender || payload?.contact_inbox || payload?.messages?.[0]?.sender;
    const userId = contact?.id ? String(contact.id) : `ext-${String(conversationId)}`;

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: contact?.name ?? contact?.identifier ?? "Contacto",
          email: contact?.email ?? null,
          phone: contact?.phone_number ?? contact?.source_id ?? null,
        },
      });
    }

    // asegurar conversación
    let conversation = await prisma.conversation.findUnique({ where: { id: String(conversationId) } });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { id: String(conversationId), userId: user.id },
      });
    }

    // guardar mensaje entrante
    const incomingMsg = payload?.messages?.[0];
    try {
      await prisma.message.create({
        data: {
          id: incomingMsg?.id ? String(incomingMsg.id) : undefined,
          role: "user",
          content: lastMessage ?? "",
          conversationId: conversation.id,
        },
      });
    } catch {
      await prisma.message.create({
        data: { role: "user", content: lastMessage ?? "", conversationId: conversation.id },
      });
    }

    // generar respuesta IA
    const aiReply = await generateReply(conversation.id, lastMessage ?? "");

    // guardar respuesta IA
    await prisma.message.create({
      data: { role: "assistant", content: aiReply, conversationId: conversation.id },
    });

    // enviar respuesta al canal
    await sendMessage(conversationId, aiReply);

    console.log("Respuesta enviada:", aiReply);
  } catch (err) {
    console.error("Error procesando webhook:", err);
  }
});

export default router;