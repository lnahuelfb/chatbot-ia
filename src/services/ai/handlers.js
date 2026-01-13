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

export async function handleFunctionCall(fnNameOrFilters, history) {
  // Si es llamado por nombre de función (updatePreferences)
  if (fnNameOrFilters?.name === "updatePreferences") {
    const { userId, ...payload } = fnNameOrFilters.args;

    // Llamada al backend
    await fetch(`${process.env.API_URL}/api/users/${userId}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const reply =
      "Perfecto, ya guardé tus preferencias. ¿Querés que te muestre opciones que encajen con eso?";
    history.push({ role: "assistant", content: reply });
    return reply;
  }

  const filtros = fnNameOrFilters;
  const resultados = await filtrarPropiedades(filtros);

  history.push({
    role: "developer",
    content: JSON.stringify({ filtros, resultados })
  });

  const reply = resultados.length
    ? `Tengo opciones que cumplen lo que buscas: ${resultados.map(r => `${r.titulo} por ${r.precio} MXN`).join(" | ")}. ¿Querés que afinemos algún filtro más?`
    : "No encontré propiedades con esos filtros. ¿Querés probar con otros parámetros?";

  history.push({ role: "assistant", content: reply });
  return reply;
}
