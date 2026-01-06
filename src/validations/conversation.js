import { z } from "zod";

export const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export const createConversationSchema = z.object({
  userId: z.string().uuid(),
  messages: z.array(messageSchema).optional(),
});

export const conversationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const addMessageSchema = messageSchema;