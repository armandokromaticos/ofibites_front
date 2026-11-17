// "Si subes los comensales, las cajas se ajustan solas" (Figma 3730:3130): regla de UI del editor de repetir (T-38,
// CONTRATOS-API sección 5 y DECISIONES 2026-11-17). Solo las cajas siguen a los comensales; los complementos (aunque
// sean "por persona") y los combos se ajustan a mano. El back solo recibe las cantidades finales y recalcula precios.

/** Máximo por línea que acepta `POST /cart/repeat/:orderId` (y tope del stepper de comensales). */
export const MAX_CANTIDAD_LINEA = 999;

export interface CajaAjustable {
  orderItemId: string;
  /** Personas por caja (`servings` del tamaño). */
  servings: number;
  /** Cantidad del pedido original: fija la proporción entre varias cajas. */
  orderQuantity: number;
}

const acotar = (valor: number) => Math.min(MAX_CANTIDAD_LINEA, Math.max(1, valor));

/**
 * Cajas para un número de comensales. Con una sola caja, `ceil(comensales / servings)`; con varias, los comensales se
 * reparten en la proporción de personas que cubría cada una en el pedido original, redondeando hacia arriba (mínimo 1).
 */
export function cajasParaComensales(
  cajas: readonly CajaAjustable[],
  comensales: number,
): Record<string, number> {
  const resultado: Record<string, number> = {};
  if (cajas.length === 0) return resultado;
  if (cajas.length === 1) {
    const [caja] = cajas;
    resultado[caja.orderItemId] = acotar(Math.ceil(comensales / Math.max(1, caja.servings)));
    return resultado;
  }
  const personas = (caja: CajaAjustable) => caja.servings * caja.orderQuantity;
  const personasOriginales = cajas.reduce((total, caja) => total + personas(caja), 0);
  for (const caja of cajas) {
    const parte = personasOriginales > 0 ? personas(caja) / personasOriginales : 1 / cajas.length;
    resultado[caja.orderItemId] = acotar(Math.ceil((comensales * parte) / Math.max(1, caja.servings)));
  }
  return resultado;
}

/** Comensales que cubren unas cajas: Σ servings × cantidad. */
export function comensalesDeCajas(cajas: readonly { servings: number; quantity: number }[]): number {
  return cajas.reduce((total, caja) => total + caja.servings * caja.quantity, 0);
}
