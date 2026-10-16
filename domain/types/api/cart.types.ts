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
}

/** Carrito único y compartido de la empresa, con precios recalculados por el servidor. */
export interface CartResponse {
  id: string;
  companyId: string;
  items: CartItem[];
  subtotal: number;
  /** Unidades totales: el contador del carrito de la top bar. */
  totalUnits: number;
  createdAt: string;
  updatedAt: string;
}
