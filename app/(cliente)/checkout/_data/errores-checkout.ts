import { CheckoutErrorCode, CheckoutUnavailableError, CheckoutUnavailableItem } from "@/domain/types";
import { getApiErrorMessage, getApiErrorMessages, isApiError } from "@/shared/utils";

/** A dónde lleva la acción de un error del checkout. */
export type AccionErrorCheckout = "carrito" | "entrega";

export interface ErrorCheckout {
  /** Frase inicial destacada. */
  title: string;
  /** Detalle y qué hacer. */
  detail: string;
  /** Líneas que impiden confirmar (400 con `unavailableItems`), con su motivo. */
  items?: CheckoutUnavailableItem[];
  /** Enlace para resolverlo: volver al carrito o al paso de entrega. */
  accion?: AccionErrorCheckout;
  /**
   * No se sabe si el pedido se creó (red caída, 408 o 5xx tras enviar): no se redirige y, antes de dejar
   * reintentar, se busca el pedido en `GET /orders`.
   */
  incierto?: boolean;
}

/** Línea de un 400 de líneas no disponibles, si el cuerpo las trae. */
function lineasNoDisponibles(body: unknown): CheckoutUnavailableItem[] | null {
  if (typeof body !== "object" || body === null || !("unavailableItems" in body)) return null;
  const items = (body as Partial<CheckoutUnavailableError>).unavailableItems;
  return Array.isArray(items) ? items : null;
}

/** `code` estable del 400/409 del checkout, si el cuerpo lo trae. */
function codigo(body: unknown): CheckoutErrorCode | null {
  if (typeof body !== "object" || body === null || !("code" in body)) return null;
  const code = (body as { code: unknown }).code;
  return typeof code === "string" ? (code as CheckoutErrorCode) : null;
}

// Respaldo por texto (mensajes del back de T-26a) para un back sin `code`.
const RESPALDO: { code: CheckoutErrorCode; patron: RegExp; status: number }[] = [
  { code: "TOTAL_CHANGED", patron: /precio|total del pedido/i, status: 409 },
  { code: "CART_CHANGED", patron: /./, status: 409 },
  { code: "CART_EMPTY", patron: /carrito está vacío/i, status: 400 },
  { code: "DELIVERY_CUTOFF", patron: /a partir de mañana|se agendan hasta/i, status: 400 },
  { code: "DELIVERY_HORIZON", patron: /más de \d+ días/i, status: 400 },
  { code: "ADDRESS_NOT_SHIPPING", patron: /no está habilitada para entregas/i, status: 400 },
];

const INCIERTO: ErrorCheckout = {
  title: "No pudimos confirmar si tu pedido se registró.",
  detail: "Revisa la campana de notificaciones o tus pedidos antes de volver a intentarlo.",
  incierto: true,
};

/** `true` si el fallo puede haber llegado después de crear el pedido: red, timeout (408) o 5xx. */
export function esFalloIncierto(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  return isApiError(error) && (error.statusCode === 408 || error.statusCode >= 500);
}

function porCodigo(
  code: CheckoutErrorCode,
  detalleBack: string | null,
  items: CheckoutUnavailableItem[] | null,
): ErrorCheckout | null {
  switch (code) {
    case "TOTAL_CHANGED":
      return {
        title: "Los precios cambiaron.",
        detail: "Actualizamos el resumen con los precios de hoy: revísalo y vuelve a confirmar.",
      };
    case "CART_CHANGED":
      return {
        title: "El carrito cambió mientras confirmabas.",
        detail: "Alguien de tu empresa lo modificó o ya se confirmó. Actualizamos el resumen: revísalo y vuelve a confirmar.",
      };
    case "CART_EMPTY":
      return { title: "Tu carrito está vacío.", detail: "Agrega productos antes de confirmar.", accion: "carrito" };
    case "CART_ITEMS_UNAVAILABLE":
      return {
        title: "Hay productos que ya no están disponibles.",
        detail: "Quítalos o cámbialos en el carrito para confirmar el pedido.",
        items: items ?? undefined,
        accion: "carrito",
      };
    case "DELIVERY_CUTOFF":
      return {
        title: "Esa fecha ya no llega al corte.",
        detail: detalleBack ?? "Los pedidos se agendan hasta las 3:00 p.m. del día anterior. Elige otra fecha.",
        accion: "entrega",
      };
    case "DELIVERY_HORIZON":
      return {
        title: "Esa fecha está demasiado lejos.",
        detail: detalleBack ?? "Elige una fecha más cercana.",
        accion: "entrega",
      };
    case "ADDRESS_NOT_SHIPPING":
      return { title: "Esa sede no recibe entregas.", detail: "Vuelve a la entrega y elige otra.", accion: "entrega" };
    default:
      return null;
  }
}

/** Error de "Confirmar pedido" (`POST /orders/checkout`) en español, con la salida que le corresponde. */
export function errorCheckout(error: unknown): ErrorCheckout {
  if (esFalloIncierto(error)) return INCIERTO;
  if (!isApiError(error)) {
    return {
      title: "No pudimos confirmar el pedido.",
      detail: getApiErrorMessage(error, "Inténtalo de nuevo en unos segundos."),
    };
  }

  // Mensaje del back en español (no los arrays de class-validator, que vienen en inglés).
  const detalleBack = Array.isArray(error.message) ? null : (getApiErrorMessages(error)[0] ?? null);
  const items = lineasNoDisponibles(error.body);

  if (error.statusCode === 400 || error.statusCode === 409) {
    // Primero el `code` estable del back; si no viene, las líneas no disponibles y luego el texto.
    let code = codigo(error.body);
    if (!code && items && items.length > 0) code = "CART_ITEMS_UNAVAILABLE";
    if (!code && detalleBack) {
      const pista = RESPALDO.find((p) => p.status === error.statusCode && p.patron.test(detalleBack));
      code = pista?.code ?? null;
    }
    if (!code && error.statusCode === 409) code = "CART_CHANGED";
    const mapeado = code ? porCodigo(code, detalleBack, items) : null;
    if (mapeado) return mapeado;
    return {
      title: "Revisa los datos de la entrega.",
      detail: detalleBack ?? "Algún dato no tiene el formato esperado.",
      accion: "entrega",
    };
  }
  if (error.statusCode === 403) {
    return {
      title: "No puedes hacer pedidos en esta empresa.",
      detail: "Tu rol no permite confirmar pedidos. Si crees que es un error, habla con el administrador de tu empresa.",
    };
  }
  if (error.statusCode === 404) {
    return {
      title: "Esa dirección ya no está en la agenda de tu empresa.",
      detail: "Vuelve a la entrega y elige otra sede.",
      accion: "entrega",
    };
  }
  return {
    title: "No pudimos confirmar el pedido.",
    detail: getApiErrorMessage(error, "Inténtalo de nuevo en unos segundos."),
  };
}
