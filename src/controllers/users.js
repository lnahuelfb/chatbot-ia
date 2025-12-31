import { prisma } from "../db/prisma.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    console.log("Datos recibidos para crear usuario:", req.body);

    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Ya existe un usuario con ese email" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
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
      where: { id: Number(id) },
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
    const { name, email, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
      },
    });
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};