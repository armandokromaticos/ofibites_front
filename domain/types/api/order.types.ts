// Órdenes: `GET /api/orders` (con `X-Company-Id`, restringe a esa empresa). Alineado con `OrderResponseDto`
// del back (`src/core/application/dto/orders/order-response.dto.ts`). Los importes llegan en `null` para roles
// sin acceso a precios.

import type { OrderInvoice, OverdueInvoiceSummary } from "./invoice.types";

export type OrderPriority = "LOW" | "MEDIUM" | "HIGH";

/**
 * Grupo de estado para "Pedidos realizados" (T-28), calculado por el back (`getOrderStatusGroup`,
 * `order-status-groups.ts`) y expuesto como `OrderResponseDto.statusGroup`. Mapeo en
 * `gestion/DECISIONES.md` (2026-10-20): recibido = CREATED/PENDING_APPROVAL/PENDING_CONFIRMATION/IN_ADJUSTMENT,
 * programado = CONFIRMED/IN_PREPARATION, en_transito = IN_TRANSIT, entregado = DELIVERED,
 * cancelado = REJECTED/CANCELLED.
 */
export type OrderStatusGroup = "received" | "scheduled" | "in_transit" | "delivered" | "cancelled";

export interface OrderItemModifier {
  id: string;
  modifierId: string;
  priceAdjustment: number | null;
}

export interface OrderItem {
  id: string;
  /** Obligatorio también en una línea de combo. */
  productId: string;
  productSizeId: string | null;
  comboId: string | null;
  quantity: number;
  unitPrice: number | null;
  subtotal: number | null;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  userId: string | null;
  couponId: string | null;
  companyId: string;
  branchId: string | null;
  departmentId: string | null;
  createdById: string;
  deliveryAddressId: string;
  /** Columna `@db.Date`: medianoche UTC (`"2026-10-16T00:00:00.000Z"`), se lee como fecha pura. */
  deliveryDate: string | null;
  /** `"HH:mm"` en hora de Caracas. */
  deliveryTime: string | null;
  notes: string | null;
  priority: OrderPriority;
  /** Un `OrderStatus`; el DTO lo tipa como string. */
  status: string;
  /** Grupo de estado para filtros y badges de "Pedidos realizados" (T-28a, ya real en el back). */
  statusGroup: OrderStatusGroup;
  subtotal: number | null;
  discount: number | null;
  /** IVA guardado al crear el pedido (T-26a; 0 en los anteriores al checkout). `null` solo para `OPERATOR`. */
  tax: number | null;
  /** Envío guardado al crear el pedido (T-26a; 0 en los anteriores al checkout). `null` solo para `OPERATOR`. */
  shipping: number | null;
  total: number | null;
  /** Número legible `OF-AAAA-NNNN`, secuencial por año de Caracas (T-26a). Todos lo tienen tras la migración. */
  orderNumber: string | null;
  /** Quién recibe el pedido (T-26a). `null` en pedidos anteriores al checkout. */
  receiverName: string | null;
  receiverPhone: string | null;
  /** Piso u oficina. */
  addressDetail: string | null;
  /** Punto de referencia. */
  addressReference: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  /**
   * Factura del pedido (T-06): se emite al pasar a `CONFIRMED`. `null` si aún no se confirmó, si es anterior a T-06
   * sin backfill o para `OPERATOR`. Opcional por si una respuesta antigua no lo trae.
   */
  invoice?: OrderInvoice | null;
}

/**
 * Body de `POST /orders/checkout` (T-26a): crea el pedido desde el carrito de la empresa activa y lo vacía, en una
 * transacción. Los importes no viajan: el servidor los recalcula.
 */
export interface CheckoutRequest {
  deliveryAddressId: string;
  /**
   * `"YYYY-MM-DD"`: desde mañana en hora de Caracas (mañana solo antes de las 15:00 de Caracas de hoy) y hasta 90
   * días después de hoy.
   */
  deliveryDate: string;
  /** `"HH:mm"`, hora de pared de Caracas. */
  deliveryTime: string;
  /** 2-120 caracteres. */
  receiverName: string;
  /** 7-20 caracteres de dígitos, espacios, `+` y `-`, con al menos 7 dígitos. */
  receiverPhone: string;
  /** Piso u oficina, ≤ 120. */
  addressDetail?: string;
  /** Punto de referencia, ≤ 200. */
  addressReference?: string;
  /** ≤ 500. */
  notes?: string;
  /** `summary.total` que el usuario vio al confirmar: si el servidor calcula otro, responde 409 y no guarda nada. */
  expectedTotal?: number;
}

/** Respuesta 201 de `POST /orders/checkout`: el pedido como `GET /orders/:id`, con los campos nuevos. */
export type CheckoutResponse = Order;

/** Línea del carrito que impide confirmar (400 de `POST /orders/checkout`). */
export interface CheckoutUnavailableItem {
  cartItemId: string;
  productId: string;
  comboId: string | null;
  /** En español. */
  name: string;
  /** "Ya no está disponible", "Ya no está disponible con el tamaño o los extras elegidos", "Ya no existe en el catálogo". */
  reason: string;
}

/** Cuerpo del 400 de `POST /orders/checkout` cuando hay líneas no disponibles. */
export interface CheckoutUnavailableError {
  statusCode: 400;
  error: string;
  message: string;
  code: "CART_ITEMS_UNAVAILABLE";
  unavailableItems: CheckoutUnavailableItem[];
}

/** `code` estable de los 400 y 409 de `POST /orders/checkout` (revisión de T-26a). */
export type CheckoutErrorCode =
  | "DELIVERY_CUTOFF"
  | "DELIVERY_HORIZON"
  | "CART_EMPTY"
  | "CART_ITEMS_UNAVAILABLE"
  | "ADDRESS_NOT_SHIPPING"
  | "CART_CHANGED"
  | "TOTAL_CHANGED"
  | "COUPON_INVALID"
  /** T-06: la empresa tiene alguna factura vencida (cuerpo con `overdueInvoices`). */
  | "INVOICE_OVERDUE"
  /** T-06: el total supera el crédito disponible (cuerpo con `total` y `available`). */
  | "CREDIT_LIMIT_EXCEEDED";

/**
 * `code` de `PATCH /orders/:id/status` y `POST /orders/:id/cancel` (T-06c; no los emite el checkout): 409 si el pedido
 * cambió de estado entre la lectura y la escritura, 400 si su factura tiene pagos aprobados. El front aún no usa estos
 * endpoints.
 */
export type OrderStatusUpdateErrorCode = "ORDER_STATUS_CHANGED" | "ORDER_HAS_APPROVED_PAYMENTS";

/** Cuerpo del 400 `INVOICE_OVERDUE` de `POST /orders/checkout` (T-06). */
export interface CheckoutInvoiceOverdueError {
  statusCode: 400;
  error: string;
  message: string;
  code: "INVOICE_OVERDUE";
  /** Todas las vencidas, la más antigua primero. */
  overdueInvoices: OverdueInvoiceSummary[];
}

/** Cuerpo del 400 `CREDIT_LIMIT_EXCEEDED` de `POST /orders/checkout` (T-06). */
export interface CheckoutCreditLimitError {
  statusCode: 400;
  error: string;
  message: string;
  code: "CREDIT_LIMIT_EXCEEDED";
  total: number;
  available: number;
}
