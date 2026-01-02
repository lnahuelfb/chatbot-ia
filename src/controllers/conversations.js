import { prisma } from "../db/prisma.js";
import { createConversationSchema, updateConversationSchema } from "../validations/conversation.js";

export const createConversation = async (req, res) => {
  try {
    const validation = createConversationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    
    const { user, messages } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        user,
        messages,
      },
    });

    return res.status(201).json({
      id: conversation.id,
      user: conversation.user,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
    });

  } catch (error) {
    console.error("Error creando conversación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const addMessageToConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, content } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: String(id) },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }
    
    const newMessage = { role, content };
    const updatedMessages = [...conversation.messages, newMessage];
    const updatedConversation = await prisma.conversation.update({
      where: { id: String(id) },
      data: { messages: updatedMessages },
    });
    
    return res.status(200).json({
      id: updatedConversation.id,
      user: updatedConversation.user,
      messages: updatedConversation.messages,
      createdAt: updatedConversation.createdAt,
    });
  } catch (error) {
    console.error("Error agregando mensaje a la conversación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.conversation.delete({
      where: { id: String(id) },
    });
    return res.status(204).send();
  } catch (error) {
    console.error("Error eliminando conversación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany();
    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Error obteniendo conversaciones:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: String(id) },
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }
    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error obteniendo conversación por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateConversationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { user, messages } = req.body;

    const conversation = await prisma.conversation.update({
      where: { id: String(id) },
      data: {
        user,
        messages,
      },
    });

    return res.status(200).json({
      id: conversation.id,
      user: conversation.user,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
    });
  } catch (error) {
    console.error("Error actualizando conversación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}