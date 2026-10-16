import { CheckoutRequest, CheckoutResponse, Order } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

export const orderService = {
  /**
   * Órdenes visibles para el usuario. `authFetcher` envía `X-Company-Id` (la empresa activa), que las restringe
   * a esa empresa. Sin paginar: el back devuelve todas.
   */
  list: (): Promise<Order[]> => authFetcher<Order[]>("/orders"),

  /** `GET /orders/:id`: un pedido visible para el usuario (403 sin acceso, 404 si no existe o es de otra empresa). */
  get: (orderId: string): Promise<Order> => authFetcher<Order>(`/orders/${encodeURIComponent(orderId)}`),

  /**
   * `POST /orders/checkout` (T-26a): crea el pedido desde el carrito de la empresa activa y lo vacía, en una
   * transacción. 400 por validación, carrito vacío, líneas no disponibles o fecha fuera de corte; 403 rol o
   * empresa; 404 dirección de otra empresa.
   */
  checkout: (body: CheckoutRequest): Promise<CheckoutResponse> =>
    authFetcher<CheckoutResponse>("/orders/checkout", { method: "POST", body: JSON.stringify(body) }),
};
