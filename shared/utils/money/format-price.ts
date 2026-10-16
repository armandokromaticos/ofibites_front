// Precios que devuelve la API como string decimal ("45.00"). Solo se formatean: la verdad es del servidor.

const FORMATO = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const FORMATO_DECIMALES = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "$45" o "$45,50" (con céntimos solo si los hay). Un valor no numérico devuelve "". */
export function formatPrice(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "";
  const formato = Number.isInteger(amount) ? FORMATO : FORMATO_DECIMALES;
  return `$${formato.format(amount)}`;
}

/** Rango de precio de un ítem del catálogo: "$45" si es único, "$45 – $120" si varía. */
export function formatPriceRange(from: string, to: string): string {
  const desde = formatPrice(from);
  const hasta = formatPrice(to);
  if (!desde) return hasta;
  if (!hasta || Number(from) === Number(to)) return desde;
  return `${desde} – ${hasta}`;
}
