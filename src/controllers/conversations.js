import { prisma } from "../db/prisma.js";
import { createConversationSchema, addMessageSchema } from "../validations/conversation.js";

export const createConversation = async (req, res) => {
  const validation = createConversationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const { userId, messages } = validation.data;

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        ...(messages && {
          messages: { create: messages }
        })
      },
      include: { messages: true }
    });

    res.status(201).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const addMessageToConversation = async (req, res) => {
  const validation = addMessageSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const message = await prisma.message.create({
      data: {
        ...validation.data,
        conversationId: req.params.id
      }
    });

    res.status(201).json(message);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    await prisma.conversation.delete({
      where: { id: req.params.id }
    });

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getConversations = async (_, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getConversationById = async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
