// Carrito de la empresa: `/api/cart` (requiere `X-Company-Id`). Alineado con `CartResponseDto` y
// `AddCartItemDto` del back (`src/core/application/dto/cart/`).

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
}

/**
 * Resumen del carrito (contrato "Checkout fase 1", T-26a). Todo lo calcula el servidor en céntimos; el front solo
 * lo pinta. `tax` = (subtotal − discount) × taxRate; `shipping` = 0 desde `freeShippingThreshold` (150), si no la
 * tarifa fija ($5 por defecto), y 0 con el carrito vacío; `total` = subtotal − discount + tax + shipping.
 * `discount` = 0 en la fase 1 (sin cupón).
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
