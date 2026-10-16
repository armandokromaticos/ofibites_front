import { addDaysToDateOnly, caracasNow, isDateOnly, isWallTime } from "@/shared/utils/date";

// Checkout fase 1 (T-26, decisiones del usuario del 2026-10-16): paso 1 "Entrega" → paso 2 "Revisión" → pedido.

/** Lo que el cliente rellena en el paso 1. Se conserva al ir y volver entre pasos (`useCheckoutDraftStore`). */
export interface CheckoutDraft {
  /** "YYYY-MM-DD" o "" sin elegir. */
  deliveryDate: string;
  /** "HH:mm" o "" sin elegir. */
  deliveryTime: string;
  /** Sede de la agenda (`CompanyAddress.id`), o "" sin elegir. */
  deliveryAddressId: string;
  addressDetail: string;
  addressReference: string;
  receiverName: string;
  receiverPhone: string;
  notes: string;
}

export const EMPTY_CHECKOUT_DRAFT: CheckoutDraft = {
  deliveryDate: "",
  deliveryTime: "",
  deliveryAddressId: "",
  addressDetail: "",
  addressReference: "",
  receiverName: "",
  receiverPhone: "",
  notes: "",
};

/** Atajos de hora del Figma (3462:2094). "Otra hora" abre el campo libre. */
export const CHECKOUT_SUGGESTED_TIMES = ["08:00", "09:00", "10:30", "12:00"] as const;

/** Hora de corte del día anterior, en hora de Caracas (15:00). */
const CUTOFF_MINUTES = 15 * 60;

/** Texto del aviso de corte (decisión del usuario 2026-10-16). */
export const CHECKOUT_CUTOFF_NOTICE = "Los pedidos se agendan hasta las 3:00 p.m. del día anterior.";

/**
 * Primera fecha de entrega que se puede pedir ahora mismo (regla de T-26a, que el back también valida): mañana en
 * hora de Caracas si aún no son las 15:00 en Caracas; si ya pasaron, pasado mañana.
 */
export function firstDeliveryDate(now: Date = new Date()): string {
  const { date, minutes } = caracasNow(now);
  return addDaysToDateOnly(date, minutes < CUTOFF_MINUTES ? 1 : 2);
}

/** Horizonte máximo de la fecha de entrega (T-26a): hoy en Caracas + 90 días. */
export const CHECKOUT_MAX_DAYS_AHEAD = 90;

/** Última fecha de entrega que se puede pedir: hoy en hora de Caracas + 90 días. */
export function lastDeliveryDate(now: Date = new Date()): string {
  return addDaysToDateOnly(caracasNow(now).date, CHECKOUT_MAX_DAYS_AHEAD);
}

export type CheckoutDraftField = keyof CheckoutDraft;
export type CheckoutDraftErrors = Partial<Record<CheckoutDraftField, string>>;

/** Límites del contrato de `POST /orders/checkout`. */
export const CHECKOUT_LIMITS = {
  receiverName: { min: 2, max: 120 },
  receiverPhone: { min: 7, max: 20 },
  addressDetail: 120,
  addressReference: 200,
  notes: 500,
} as const;

const PHONE_PATTERN = /^[0-9 +-]+$/;

/**
 * Valida el paso 1 con las reglas del contrato. Devuelve un mensaje en español por campo inválido (vacío si todo
 * está bien). `now` decide el corte: se vuelve a calcular al enviar, por si el reloj pasó las 15:00 con la página
 * abierta.
 */
export function validateCheckoutDraft(
  draft: CheckoutDraft,
  now: Date = new Date(),
): CheckoutDraftErrors {
  const errors: CheckoutDraftErrors = {};
  const first = firstDeliveryDate(now);

  if (!draft.deliveryDate) errors.deliveryDate = "Elige la fecha de entrega.";
  else if (!isDateOnly(draft.deliveryDate)) errors.deliveryDate = "Escribe una fecha válida.";
  else if (draft.deliveryDate < first) {
    errors.deliveryDate = "Esa fecha ya no llega al corte de las 3:00 p.m. del día anterior. Elige otra.";
  } else if (draft.deliveryDate > lastDeliveryDate(now)) {
    errors.deliveryDate = `Solo agendamos pedidos hasta ${CHECKOUT_MAX_DAYS_AHEAD} días por adelantado. Elige una fecha anterior.`;
  }

  if (!draft.deliveryTime) errors.deliveryTime = "Elige la hora de entrega.";
  else if (!isWallTime(draft.deliveryTime)) errors.deliveryTime = "Escribe una hora válida.";

  if (!draft.deliveryAddressId) errors.deliveryAddressId = "Elige dónde recibimos el pedido.";

  const name = draft.receiverName.trim();
  if (!name) errors.receiverName = "Escribe quién recibe el pedido.";
  else if (name.length < CHECKOUT_LIMITS.receiverName.min) errors.receiverName = "El nombre es demasiado corto.";
  else if (name.length > CHECKOUT_LIMITS.receiverName.max) {
    errors.receiverName = `Máximo ${CHECKOUT_LIMITS.receiverName.max} caracteres.`;
  }

  const phone = draft.receiverPhone.trim();
  if (!phone) errors.receiverPhone = "Escribe un teléfono de contacto.";
  else if (!PHONE_PATTERN.test(phone)) errors.receiverPhone = "Usa solo números, espacios, + y -.";
  else if (phone.replace(/\D/g, "").length < CHECKOUT_LIMITS.receiverPhone.min) {
    errors.receiverPhone = "El teléfono debe tener al menos 7 dígitos.";
  }
  else if (
    phone.length < CHECKOUT_LIMITS.receiverPhone.min ||
    phone.length > CHECKOUT_LIMITS.receiverPhone.max
  ) {
    errors.receiverPhone = "El teléfono debe tener entre 7 y 20 caracteres.";
  }

  if (draft.addressDetail.trim().length > CHECKOUT_LIMITS.addressDetail) {
    errors.addressDetail = `Máximo ${CHECKOUT_LIMITS.addressDetail} caracteres.`;
  }
  if (draft.addressReference.trim().length > CHECKOUT_LIMITS.addressReference) {
    errors.addressReference = `Máximo ${CHECKOUT_LIMITS.addressReference} caracteres.`;
  }
  if (draft.notes.trim().length > CHECKOUT_LIMITS.notes) errors.notes = `Máximo ${CHECKOUT_LIMITS.notes} caracteres.`;

  return errors;
}

/** Línea del pedido tal como se vio al confirmarlo (la respuesta del pedido no trae nombre ni foto). */
export interface ConfirmedOrderLine {
  id: string;
  name: string;
  imageSrc: string | null;
  quantity: number;
  subtotal: number;
}

/** Lo que la pantalla "Pedido confirmado" necesita y el pedido no trae: líneas con nombre y nombre de la sede. */
export interface ConfirmedOrderSnapshot {
  orderId: string;
  lines: ConfirmedOrderLine[];
  addressLabel: string | null;
  /** Tasa de IVA del resumen al confirmar (fracción), para la etiqueta "IVA (16%)": el pedido no la trae. */
  taxRate: number | null;
}
