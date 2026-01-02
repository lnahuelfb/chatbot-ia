import { z } from "zod";

export const createConversationSchema = z.object({
  user: z.string({ message: "El usuario es obligatorio" }).min(1, { message: "El usuario no puede estar vacío" }),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"], { message: "El rol debe ser 'user', 'assistant' o 'system'" }),
      content: z.string({ message: "El contenido es obligatorio" }).min(1, { message: "El contenido no puede estar vacío" }),
    })
  ).nonempty({ message: "Debe haber al menos un mensaje en la conversación" }),
});

export const updateConversationSchema = z.object({
  user: z.string({ message: "El usuario es obligatorio" }).min(1, { message: "El usuario no puede estar vacío" }),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"], { message: "El rol debe ser 'user', 'assistant' o 'system'" }),
      content: z.string({ message: "El contenido es obligatorio" }).min(1, { message: "El contenido no puede estar vacío" }),
    })
  ).nonempty({ message: "Debe haber al menos un mensaje en la conversación" }),
});
