import { z } from "zod";

export const upsertPreferenceSchema = z.object({
  zona: z.string().min(1).optional(),
  tipoPropiedad: z.enum(["casa", "departamento", "terreno"]).optional(),
  recamaras: z.number().int().positive().optional(),
  presupuestoMax: z.number().int().positive().optional(),
  operacion: z.enum(["compra", "renta"]).optional(),
  profileCompleted: z.boolean().optional(),
});
