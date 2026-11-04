// Notificaciones del usuario: `/api/notifications` (contrato "Notificaciones del usuario" en
// gestion/CONTRATOS-API.md, T-22a). `X-Company-Id` es opcional: si va, filtra a esa empresa (más las que no
// tienen empresa).

import type { OrderStatus } from "@/domain/models/order-status.model";

/** T-06 suma `INVOICE_GENERATED` y `PAYMENT_STATUS_CHANGED` (con `orderStatus: null`: el icono sale del `type`). */
export type NotificationType = "ORDER_STATUS" | "INVOICE_GENERATED" | "PAYMENT_STATUS_CHANGED";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  /** En español y listo para mostrar ("Tu pedido #56790 va en camino."). */
  message: string;
  /** Ruta relativa del front ("/pedidos/<id>") o `null`. */
  link: string | null;
  orderId: string | null;
  orderNumber: string | null;
  orderStatus: OrderStatus | null;
  /** T-06: factura a la que se refiere el aviso, o `null`. */
  invoiceId?: string | null;
  companyId: string | null;
  /** ISO; `null` = sin leer. */
  readAt: string | null;
  createdAt: string;
}

/** Query de `GET /notifications`. `take` máx. 50 (20 por defecto). */
export interface NotificationsQuery {
  unread?: boolean;
  skip?: number;
  take?: number;
}

/** `GET /notifications`: página ordenada por `createdAt` desc. `unreadCount` es el total sin leer (no solo la página). */
export interface NotificationsResponse {
  data: NotificationDto[];
  total: number;
  unreadCount: number;
}

/** `PATCH /notifications/read-all`. */
export interface MarkAllNotificationsReadResponse {
  updated: number;
}
