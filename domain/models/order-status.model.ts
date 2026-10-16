/** Estados de `Order` del backend (`OrderStateMachine`, ver conocimiento/reglas-negocio.md). */
export type OrderStatus =
  | "CREATED"
  | "PENDING_APPROVAL"
  | "PENDING_CONFIRMATION"
  | "IN_ADJUSTMENT"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

/** Texto del estado para el cliente. "En camino" y "Entregado" son los del Figma (Dashboard). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: "Creado",
  PENDING_APPROVAL: "Por aprobar",
  PENDING_CONFIRMATION: "Por confirmar",
  IN_ADJUSTMENT: "En ajuste",
  CONFIRMED: "Confirmado",
  IN_PREPARATION: "En preparación",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

/** Paso de la línea de estados del pedido para el cliente ("Pedido confirmado", Figma 3465:3585). */
export interface OrderProgressStep {
  label: string;
  /** Estados del back que caen en este paso. */
  statuses: readonly OrderStatus[];
}

/**
 * Línea de estados del Figma adaptada a `OrderStatus` (fase 1, sin pagos): el Figma traía "En validación de pago" y
 * "Programado", que no existen en el back. La aprobación interna, la confirmación de Ofibites y el ajuste caen en
 * "Por confirmar"; confirmado y en preparación, en "Confirmado". `REJECTED` y `CANCELLED` no son pasos: la vista los
 * trata aparte.
 */
export const ORDER_PROGRESS_STEPS: readonly OrderProgressStep[] = [
  { label: "Recibido", statuses: ["CREATED"] },
  { label: "Por confirmar", statuses: ["PENDING_APPROVAL", "PENDING_CONFIRMATION", "IN_ADJUSTMENT"] },
  { label: "Confirmado", statuses: ["CONFIRMED", "IN_PREPARATION"] },
  { label: "En camino", statuses: ["IN_TRANSIT"] },
  { label: "Entregado", statuses: ["DELIVERED"] },
];

/** `true` si el string es un `OrderStatus` conocido. */
export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_LABELS;
}

/** Índice del paso en el que está el pedido, o `-1` si es rechazado, cancelado o desconocido. */
export function orderProgressIndex(status: string): number {
  if (!isOrderStatus(status)) return -1;
  return ORDER_PROGRESS_STEPS.findIndex((step) => step.statuses.includes(status));
}
