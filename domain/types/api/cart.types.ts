// Carrito de la empresa: `/api/cart` (requiere `X-Company-Id`). Alineado con `CartResponseDto` y
// `AddCartItemDto` del back (`src/core/application/dto/cart/`).

import type { CartCreditLine, CartInvoiceAlert } from "./invoice.types";

export interface CartItemModifierInput {
  modifierId: string;
}

/**
 * Body de `POST /cart/items`. `productId` es obligatorio también en un combo; `comboId` y `productSizeId`
 * son excluyentes. Si ya hay una línea idéntica, el back suma la cantidad.
 */
export interface AddCartItemRequest {
  productId: string;
  productSizeId?: string;
  comboId?: string;
  /** Entero ≥ 1. */
  quantity: number;
  modifiers?: CartItemModifierInput[];
}

export interface CartItemModifier {
  modifierId: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productSizeId: string | null;
  comboId: string | null;
  quantity: number;
  /** Precio unitario vigente (sin modificadores). */
  unitPrice: number;
  /** (unitPrice + modificadores) × quantity, con precios vigentes. */
  subtotal: number;
  addedById: string | null;
  modifiers: CartItemModifier[];
  /** Nombre del combo (si hay `comboId`) o del producto, en el idioma pedido; también si está inactivo. */
  name: string;
  /** Imagen principal del producto o combo (la misma que `GET /catalog`). */
  image: string | null;
  /** Nombre del tamaño elegido, o `null` sin tamaño. */
  sizeLabel: string | null;
  /** Personas del tamaño, o `null`. */
  servings: number | null;
  /**
   * Si la línea se podría añadir hoy (producto/combo, tamaño y extras activos). Solo informativo: el carrito
   * cotiza todas las líneas.
   */
  isAvailable: boolean;
  /** Nombres de las etiquetas del producto o combo en el idioma pedido ("Sin gluten"); `[]` si no tiene. */
  tags: string[];
}

/**
 * Resumen del carrito (contrato "Checkout fase 1", T-26a). Todo lo calcula el servidor en céntimos; el front solo
 * lo pinta. `tax` = (subtotal − discount) × taxRate; `shipping` = 0 desde `freeShippingThreshold` (150), si no la
 * tarifa fija ($5 por defecto), y 0 con el carrito vacío; `total` = subtotal − discount + tax + shipping.
 * `discount`: el del cupón vigente (`CartResponse.coupon`), calculado por el servidor; 0 sin cupón o si no está vigente.
 */
export interface CartSummary {
  subtotal: number;
  discount: number;
  /** Fracción: 0.16 = 16 %. */
  taxRate: number;
  tax: number;
  shipping: number;
  freeShippingThreshold: number;
  total: number;
}

/** Cupón aplicado al carrito (`POST /cart/coupon`). El descuento en dinero es `summary.discount`: nunca se calcula aquí. */
export interface CartCoupon {
  code: string;
  /** 10 = 10 %. Solo para mostrar. */
  discountPercent: number;
  /** `false` si dejó de valer: no descuenta y el checkout responde 400 hasta quitarlo. */
  isValid: boolean;
}

/** Body de `POST /cart/coupon`. */
export interface ApplyCartCouponRequest {
  code: string;
}

/** Carrito único y compartido de la empresa, con precios recalculados por el servidor. Líneas por `createdAt` asc. */
export interface CartResponse {
  id: string;
  companyId: string;
  items: CartItem[];
  subtotal: number;
  /** Unidades totales: el contador del carrito de la top bar. */
  totalUnits: number;
  /** Subtotal, IVA, envío y total del servidor. Va en todas las respuestas que devuelven el carrito (T-26a). */
  summary: CartSummary;
  /** Cupón aplicado, o `null`. */
  coupon: CartCoupon | null;
  /** T-06: factura vencida (bloquea el checkout) o por vencer en 0–3 días; `null` si no hay. Opcional en respuestas antiguas. */
  invoiceAlert?: CartInvoiceAlert | null;
  /** T-06: línea de crédito con `exceedsAvailable`; `null` si la empresa es de contado. */
  creditLine?: CartCreditLine | null;
  createdAt: string;
  updatedAt: string;
}

/** Línea de un pedido que no se pudo copiar al carrito al repetir. */
export interface RepeatCartSkippedLine {
  productId: string;
  comboId: string | null;
  name: string;
  /** En español: "Ya no está disponible", "Ya no existe en el catálogo"… */
  reason: string;
}

/** `POST /cart/repeat/last` y `POST /cart/repeat/:orderId` (copian al carrito; no crean pedido). */
export interface RepeatCartResponse {
  cart: CartResponse;
  /** Líneas del pedido copiadas (no unidades). */
  added: number;
  skipped: RepeatCartSkippedLine[];
}

/** Línea elegida en el editor "Repetir pedido" (T-38): línea del pedido original y cantidad final (entero 1–999). */
export interface RepeatOrderItemInput {
  orderItemId: string;
  quantity: number;
}

/**
 * Body opcional de `POST /cart/repeat/:orderId` y de `POST /cart/repeat/:orderId/preview` (T-38). Sin body (o sin
 * `items`): todas las líneas con su cantidad original. Con `items` (1–100): solo esas líneas, con esas cantidades.
 */
export interface RepeatOrderRequest {
  items?: RepeatOrderItemInput[];
}

/** Motivo estable de una línea no disponible (misma regla que `skipped` de `POST /cart/repeat`). */
export type RepeatUnavailableCode = "UNAVAILABLE" | "CONFIGURATION" | "NOT_FOUND";

/** Línea de la vista previa de repetir (T-38). */
export interface RepeatPreviewLine {
  orderItemId: string;
  productId: string;
  productSizeId: string | null;
  comboId: string | null;
  kind: "box" | "complement";
  name: string;
  image: string | null;
  sizeLabel: string | null;
  sizeDescription: string | null;
  description: string | null;
  servings: number | null;
  /** `false` si el body trae `items` y no incluye esta línea (el usuario la quitó). */
  included: boolean;
  /** Cantidad del pedido original. */
  orderQuantity: number;
  /** La del body o, si no viene, la del pedido (0 si `included` es `false`). */
  quantity: number;
  /** Precio unitario congelado en el pedido: "subió de $ 22,00". */
  orderUnitPrice: number;
  /** Precio de hoy con los mismos modificadores; `null` si no está disponible. */
  currentUnitPrice: number | null;
  priceChanged: boolean;
  /** `currentUnitPrice × quantity`; `null` si no está disponible o no está incluida. */
  subtotal: number | null;
  isAvailable: boolean;
  unavailableCode: RepeatUnavailableCode | null;
  /** En español, mismos textos que `skipped`. */
  unavailableReason: string | null;
}

/** Pedido de origen de la vista previa (T-38, con los campos que pidió la revisión T-38b). */
export interface RepeatPreviewOrder {
  id: string;
  orderNumber: string | null;
  createdAt: string;
  /** Fecha pura (`@db.Date`). */
  deliveryDate: string | null;
  deliveryTime: string | null;
  deliveryAddressId: string;
  receiverName: string | null;
  receiverPhone: string | null;
  /** Comensales del pedido original. */
  diners: number | null;
  /** Total congelado del pedido original ("Mismo monto que el pedido del 26/09"). `null` para `OPERATOR`. */
  total: number | null;
  addressDetail: string | null;
  addressReference: string | null;
}

/** `POST /cart/repeat/:orderId/preview` (T-38): no escribe nada; precios de hoy calculados por el servidor. */
export interface RepeatPreviewResponse {
  order: RepeatPreviewOrder;
  /** Todas las líneas del pedido, en su orden. */
  lines: RepeatPreviewLine[];
  /** Comensales de lo elegido (cajas incluidas y disponibles). */
  diners: number | null;
  /** Resumen de las líneas incluidas y disponibles (sin cupón ni lo que ya haya en el carrito). */
  summary: CartSummary;
  /** Líneas incluidas y disponibles cuyo precio cambió. 0 → "Ningún precio cambió". */
  priceChangedCount: number;
}
