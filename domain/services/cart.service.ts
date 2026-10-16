import { AddCartItemRequest, CartResponse, RepeatCartResponse } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

/**
 * Carrito de la empresa activa: `authFetcher` envía `X-Company-Id` (sin él, el back responde 400). Todas las
 * escrituras responden 200 con el carrito completo y los precios recalculados.
 */
export const cartService = {
  get: (): Promise<CartResponse> => authFetcher<CartResponse>("/cart"),

  /** Añade una línea (o suma cantidad a una idéntica). Devuelve el carrito completo. */
  addItem: (body: AddCartItemRequest): Promise<CartResponse> =>
    authFetcher<CartResponse>("/cart/items", { method: "POST", body: JSON.stringify(body) }),

  /** `PATCH /cart/items/:id`: cambia la cantidad (entero ≥ 1). Devuelve el carrito completo. */
  updateItem: (itemId: string, quantity: number): Promise<CartResponse> =>
    authFetcher<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  /** `DELETE /cart/items/:id`: quita una línea. Devuelve el carrito completo. */
  removeItem: (itemId: string): Promise<CartResponse> =>
    authFetcher<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, { method: "DELETE" }),

  /**
   * `POST /cart/repeat/last`: copia al carrito las líneas disponibles del último pedido del usuario en la empresa
   * (sin cancelados ni rechazados), en una transacción. 404 si no hay pedido; 400 si ninguna línea sigue disponible.
   */
  repeatLast: (): Promise<RepeatCartResponse> =>
    authFetcher<RepeatCartResponse>("/cart/repeat/last", { method: "POST" }),

  /**
   * `POST /cart/repeat/:orderId`: copia al carrito las líneas disponibles de ese pedido (de la empresa y visible
   * para el usuario). 400 si ninguna sigue disponible, 403 sin acceso, 404 si no es de la empresa.
   */
  repeatOrder: (orderId: string): Promise<RepeatCartResponse> =>
    authFetcher<RepeatCartResponse>(`/cart/repeat/${encodeURIComponent(orderId)}`, { method: "POST" }),

  /** `DELETE /cart`: vacía el carrito de la empresa (compartido por todos sus compradores). */
  clear: (): Promise<CartResponse> => authFetcher<CartResponse>("/cart", { method: "DELETE" }),
};
