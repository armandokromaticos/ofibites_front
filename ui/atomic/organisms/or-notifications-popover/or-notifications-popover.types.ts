import type { OrderStatus } from "@/domain/models";

export type OrNotificationsPopoverStatus = "loading" | "error" | "ready";

export interface OrNotificationsPopoverItem {
  id: string;
  message: string;
  isUnread: boolean;
  /** Estado del pedido al que se refiere: decide el icono. `null` → campana. */
  orderStatus: OrderStatus | null;
  /** ISO del aviso (la antigüedad se calcula al pintar, en hora de Caracas). */
  createdAt: string;
  /** A dónde lleva; `null` si no hay página (solo marca como leído). */
  href: string | null;
}

export interface OrNotificationsPopoverProps {
  items: OrNotificationsPopoverItem[];
  /** Total sin leer (no solo los de la lista): el punto de la campana y su `aria-label`. */
  unreadCount: number;
  status: OrNotificationsPopoverStatus;
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Al pulsar un aviso (antes de navegar, si tiene `href`). */
  onSelect?: (item: OrNotificationsPopoverItem) => void;
  /** "Marcar como leídas". Sin valor, o sin avisos sin leer, no se pinta. */
  onMarkAllRead?: () => void;
  isMarkingAllRead?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Id base (panel y título). Por defecto `notifications-popover`. */
  id?: string;
}
