import { prisma } from "../db/prisma.js";
import { upsertPreferenceSchema } from "../validations/preference.js";

// Crea el usuario si no existe o devuelve el existente
export const ensureUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.upsert({
      where: { id },
      update: {},
      create: { id },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error asegurando usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtiene usuario con preferencias (contexto para IA)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { preference: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtiene solo las preferencias del usuario
export const getUserPreferences = async (req, res) => {
  try {
    const preference = await prisma.preference.findUnique({
      where: { userId: req.params.id },
    });

    res.json(preference ?? {});
  } catch (err) {
    console.error("Error obteniendo preferencias:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Upsert de preferencias del usuario
export const upsertPreference = async (req, res) => {
  const validation = upsertPreferenceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const userId = req.params.id;

    const preference = await prisma.preference.upsert({
      where: { userId },
      update: validation.data,
      create: {
        userId,
        ...validation.data,
      },
    });

    res.json(preference);
  } catch (err) {
    console.error("Error guardando preferencias:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
