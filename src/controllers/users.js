import { prisma } from "../db/prisma.js";
import { userSchema } from "../validations/users.js";

export const createUser = async (req, res) => {
  try {
    const validation = userSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.issues.map(e => ({
        field: e.path.join("."),
        message: e.message
      }));
      return res.status(400).json({ errors });
    }
    
    const { name, email, phone } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Ya existe un usuario con ese email" });
    }

    const user = await prisma.user.create({
      data: { name, email, phone },
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error("Error creando usuario:", error);
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
      where: { id: String(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error obteniendo usuario por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = userSchema.partial().safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.issues.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ errors });
    }

    console.log(validation)

    const { name, email, phone } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({ error: "Otro usuario ya tiene ese email" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, phone },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getUserPreferences = async (req, res) => {
  // Implementación pendiente
}

export const upsertPreference = async (req, res) => {
  const validation = upsertPreferenceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const preference = await prisma.preference.upsert({
      where: {
        userId: req.params.userId,
      },
      update: validation.data,
      create: {
        userId: req.params.userId,
        ...validation.data,
      },
    });

    res.json(preference);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
