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
  }
];
