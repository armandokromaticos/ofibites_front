import { OrderLineKind } from "@/domain/types";

// Textos de las líneas de un pedido (T-38), comunes al detalle y al editor "Repetir pedido" (Figma 3632:1686 y
// 3730:3130): caja = tamaño con `servings` (cuenta comensales); el resto, complemento (combos incluidos).

interface LineaConTextos {
  name: string;
  sizeLabel: string | null;
  sizeDescription: string | null;
  description: string | null;
  modifiers?: { name?: string }[];
}

/**
 * Título de la línea: el nombre o, si otra línea del mismo pedido se llama igual (mismo producto en dos tamaños),
 * "Nombre · tamaño" para distinguirlas.
 */
export function tituloLinea(linea: LineaConTextos, todas: readonly LineaConTextos[]): string {
  const nombre = linea.name || "Producto";
  const repetido = todas.filter((otra) => otra.name === linea.name).length > 1;
  return repetido && linea.sizeLabel ? `${nombre} · ${linea.sizeLabel}` : nombre;
}

/** Subtítulo (se recorta a una línea con CSS): descripción del tamaño o, si no hay, la del producto. */
export function subtituloLinea(linea: LineaConTextos): string | null {
  return linea.sizeDescription || linea.description || null;
}

/** "Con queso extra, sin cebolla" si los extras traen nombre (campo opcional del contrato). */
export function extrasLinea(linea: LineaConTextos): string | null {
  const nombres = (linea.modifiers ?? []).map((modifier) => modifier.name).filter(Boolean);
  return nombres.length ? `Con ${nombres.join(", ")}` : null;
}

/** Pista junto a "CAJAS DEL PEDIDO": "una caja por persona", "una caja para 10 personas", o nada si son mixtas. */
export function pistaCajas(servings: readonly (number | null)[]): string | null {
  const validos = servings.filter((valor): valor is number => valor !== null && valor > 0);
  const distintos = [...new Set(validos)];
  if (distintos.length !== 1) return null;
  return distintos[0] === 1 ? "una caja por persona" : `una caja para ${distintos[0]} personas`;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** "40 cajas", "1 caja". */
export function cajasTexto(n: number): string {
  return plural(n, "caja", "cajas");
}

/** "40 personas". */
export function personasTexto(n: number): string {
  return plural(n, "persona", "personas");
}

/** "Para 40 personas · 40 cajas + 3 complementos" (sin la parte de personas si no hay comensales). */
export function conteoCajasComplementos(
  lineas: readonly { kind: OrderLineKind; quantity: number }[],
  comensales: number | null,
): string {
  const cajas = lineas.filter((linea) => linea.kind === "box").reduce((total, linea) => total + linea.quantity, 0);
  const complementos = lineas.filter((linea) => linea.kind === "complement").length;
  const partes = [cajasTexto(cajas)];
  if (complementos) partes.push(plural(complementos, "complemento", "complementos"));
  const productos = partes.join(" + ");
  return comensales ? `Para ${personasTexto(comensales)} · ${productos}` : productos;
}
