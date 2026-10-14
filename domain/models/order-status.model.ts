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
