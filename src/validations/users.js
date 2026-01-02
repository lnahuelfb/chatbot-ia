import { z } from "zod";

const userSchema = z.object({
  name: z.string({ message: "El nombre es obligatorio" }).min(1, { message: "El nombre no puede estar vacío" }),
  email: z.string({ message: "El email es obligatorio" }).email({ message: "El email no es válido" }),
});

export { userSchema };