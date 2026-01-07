import { prisma } from "../db/prisma.js";
import { upsertPreferenceSchema } from "../validations/preferences.js";

export const ensureUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error asegurando usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        preference: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getUserPreferences = async (req, res) => {
  try {
    const preference = await prisma.preference.findUnique({
      where: { userId: req.params.id }
    });

    res.json(preference ?? {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

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
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
