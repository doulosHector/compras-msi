/**
 * Parses a CSV with Spanish headers: nombre, monto, meses, fecha
 * Returns an array of purchase objects (English field names).
 */
export function parsePurchasesCsv(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("El archivo no tiene filas de datos.");
  }

  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  const indexes = {
    name: headers.indexOf("nombre"),
    amount: headers.indexOf("monto"),
    months: headers.indexOf("meses"),
    date: headers.indexOf("fecha"),
  };

  if (Object.values(indexes).some((index) => index === -1)) {
    throw new Error(
      "Faltan columnas. Se requieren: nombre, monto, meses, fecha.",
    );
  }

  const purchases = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((value) => value.trim());
    const name = cells[indexes.name];
    const amount = parseFloat(cells[indexes.amount]);
    const months = parseInt(cells[indexes.months], 10);
    const date = cells[indexes.date];

    if (
      !name ||
      !(amount > 0) ||
      !(months > 0) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      throw new Error(
        `Fila ${i + 1} inválida. Revisa el formato de cada columna.`,
      );
    }

    purchases.push({
      id: Date.now().toString(36) + i,
      name,
      amount,
      months,
      date,
    });
  }

  return purchases;
}
