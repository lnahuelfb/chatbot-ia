import { prisma } from '../db/prisma.js';

export const savePreferences = async (userId, preferences) => {
  try {
    console.log(id, preferences)
    await prisma.preference.upsert({
      where: { userId },
      create: {
        userId,
        operacion: preferences.operacion,
        profileComplete: false,
        updatedAt: new Date(),
        tipoPropiedad: preferences.tipoPropiedad
      },
      update: {
        operacion: preferences.operacion,
        profileComplete: false,
        updatedAt: new Date(),
        tipoPropiedad: preferences.tipoPropiedad
      }
    });
  } catch (error) {
    console.error(`Error saving preferences: ${error}`);
    throw error;
  }
};
