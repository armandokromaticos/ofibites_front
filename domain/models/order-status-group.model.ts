import { OrderStatusGroup } from "@/domain/types";

/** Texto del grupo de estado para el cliente ("Pedidos realizados", T-28). */
export const ORDER_STATUS_GROUP_LABELS: Record<OrderStatusGroup, string> = {
  received: "Recibido",
  scheduled: "Programado",
  in_transit: "En tránsito",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

/** Color de `AtChip` (HeroUI) para el badge de estado de la tabla y el detalle. */
export const ORDER_STATUS_GROUP_COLORS: Record<OrderStatusGroup, "default" | "primary" | "warning" | "success" | "danger"> = {
  received: "default",
  scheduled: "warning",
  in_transit: "primary",
  delivered: "success",
  cancelled: "danger",
};

/**
 * Tabs del filtro de estado (Figma "Pedidos realizados"): los 4 grupos del tablero, sin "Cancelado"
 * (decisión 2026-10-20: existe como estado visual en la tabla, pero no es un tab de filtro).
 */
export const ORDER_STATUS_GROUP_FILTERS: readonly OrderStatusGroup[] = [
  "received",
  "scheduled",
  "in_transit",
  "delivered",
];

/**
 * Pasos del "Seguimiento" del detalle del pedido (Figma 3568:1611), en el mismo orden que los grupos de
 * filtro. Sin historial de transiciones en el back (solo se guarda el estado actual): el paso resaltado es
 * el del grupo actual, y los anteriores se muestran como cumplidos sin fecha (ver DECISIONES T-28b).
 * `cancelled`/`rejected` no tienen paso: el detalle muestra un aviso en su lugar.
 */
export const ORDER_STATUS_GROUP_STEPS: readonly OrderStatusGroup[] = [
  "received",
  "scheduled",
  "in_transit",
  "delivered",
];

/** Índice del grupo en los pasos del seguimiento, o `-1` si es `cancelled` (sin paso). */
export function orderStatusGroupStepIndex(group: OrderStatusGroup): number {
  return ORDER_STATUS_GROUP_STEPS.indexOf(group);
}
