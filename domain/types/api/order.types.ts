// Órdenes: `GET /api/orders` (con `X-Company-Id`, restringe a esa empresa). Alineado con `OrderResponseDto`
// del back (`src/core/application/dto/orders/order-response.dto.ts`). Los importes llegan en `null` para roles
// sin acceso a precios.

export type OrderPriority = "LOW" | "MEDIUM" | "HIGH";

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
  subtotal: number | null;
  discount: number | null;
  total: number | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}
