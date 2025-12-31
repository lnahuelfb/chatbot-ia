export async function filtrarPropiedades({ zona, recamaras, presupuestoMax }) {
  const allProps = [
    { titulo: "Casa en Coyoacán", zona: "Coyoacán", precio: 5000000, recamaras: 3 },
    { titulo: "Departamento en Coyoacán", zona: "Coyoacán", precio: 3200000, recamaras: 2 },
    { titulo: "Casa en Polanco", zona: "Polanco", precio: 12000000, recamaras: 4 },
    { titulo: "Departamento en Roma", zona: "Roma", precio: 4500000, recamaras: 2 },
  ];

  return allProps.filter(p =>
    (!zona || p.zona.toLowerCase() === zona.toLowerCase()) &&
    (!recamaras || p.recamaras === recamaras) &&
    (!presupuestoMax || p.precio <= presupuestoMax)
  );
}

export async function handleFunctionCall(filters, history, client) {
  const resultados = await filtrarPropiedades(filters);

  history.push({ role: "developer", content: JSON.stringify({ filtros: filters, resultados }) });

  const reply = resultados.length
    ? `Tengo opciones que cumplen lo que buscas: ${resultados.map(r => `${r.titulo} por ${r.precio} MXN`).join(" | ")}. ¿Querés que afinemos algún filtro más?`
    : "No encontré propiedades con esos filtros. ¿Querés probar con otros parámetros?";

  history.push({ role: "assistant", content: reply });
  return reply;
}

export function parseUserMessage(message) {
  const recamarasMatch = message.match(/(\d+)\s*recámaras?/i);
  const presupuestoMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(millones|mxn|pesos)/i);

  return {
    recamaras: recamarasMatch ? Number(recamarasMatch[1]) : undefined,
    presupuestoMax: presupuestoMatch
      ? Number(presupuestoMatch[1].replace(',', '.')) * 1_000_000
      : undefined
  };
}

export function parseZona(message) {
  const zonas = ["Coyoacán", "Polanco", "Condesa", "Roma", "Narvarte", "Escandón"];
  for (const zona of zonas) {
    if (message.toLowerCase().includes(zona.toLowerCase())) return zona;
  }
  return undefined;
}
