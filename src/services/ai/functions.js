export const functions = [
  {
    name: "filtrarZona",
    description: "Filtra propiedades según la zona",
    type: "function",
    parameters: {
      type: "object",
      properties: {
        zona: { type: "string" }
      },
      required: ["zona"]
    }
  },
  {
    name: "filtrarCaracteristicas",
    description: "Filtra propiedades según características",
    type: "function",
    parameters: {
      type: "object",
      properties: {
        recamaras: { type: "number" },
        presupuestoMax: { type: "number" }
      }
    }
  },
  {
    name: "updatePreferences",
    description: "Guarda o actualiza preferencias del usuario a partir de una conversación",
    type: "function",
    parameters: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        zona: { type: "string" },
        recamaras: { type: "number" },
        presupuestoMax: { type: "number" },
        operacion: { type: "string", enum: ["compra", "renta"] }
      },
      required: ["conversationId"]
    }
  }
];
