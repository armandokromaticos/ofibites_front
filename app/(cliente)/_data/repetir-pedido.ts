import { RepeatCartResponse } from "@/domain/types";
import { isApiError } from "@/shared/utils";

function productos(n: number): string {
  return `${n} ${n === 1 ? "producto" : "productos"}`;
}

/**
 * Aviso tras repetir un pedido en el carrito: "Agregamos 2 productos de tu pedido #7728950E. No se añadió:
 * Bebidas naturales (ya no está disponible)." Sin `orderNumber`, "de tu último pedido".
 */
export function avisoPedidoRepetido(
  { added, skipped }: RepeatCartResponse,
  orderNumber?: string,
): string {
  const origen = orderNumber ? `de tu pedido #${orderNumber}` : "de tu último pedido";
  const base = `Agregamos ${productos(added)} ${origen}.`;
  if (skipped.length === 0) return base;
  const omitidas = skipped.map(({ name, reason }) => `${name} (${reason.toLowerCase()})`).join(", ");
  return `${base} ${skipped.length === 1 ? "No se añadió" : "No se añadieron"}: ${omitidas}.`;
}

/**
 * Error al repetir (`POST /cart/repeat/...`) en español. Los textos del back no se muestran: solo el código decide.
 * `esUltimo`: "Repetir mi último pedido" (su 404 significa que no hay pedidos que repetir).
 */
export function mensajeErrorRepetir(error: unknown, esUltimo = false): string {
  if (isApiError(error)) {
    if (error.statusCode === 400) {
      return esUltimo
        ? "Ningún producto de tu último pedido sigue disponible. Explora el catálogo."
        : "Ningún producto de este pedido sigue disponible. Explora el catálogo para armar uno nuevo.";
    }
    if (error.statusCode === 403) return "No tienes acceso para repetir este pedido en el carrito de tu empresa.";
    if (error.statusCode === 404) {
      return esUltimo
        ? "Aún no tienes pedidos para repetir en esta empresa. Explora el catálogo y arma el primero."
        : "No encontramos este pedido en tu empresa. Recarga la página.";
    }
  }
  return esUltimo
    ? "No pudimos repetir tu último pedido. Inténtalo de nuevo."
    : "No pudimos repetir este pedido. Inténtalo de nuevo.";
}
