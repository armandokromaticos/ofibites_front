import { AddCartItemRequest, CartResponse } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

/** Carrito de la empresa activa: `authFetcher` envía `X-Company-Id` (sin él, el back responde 400). */
export const cartService = {
  get: (): Promise<CartResponse> => authFetcher<CartResponse>("/cart"),

  /** Añade una línea (o suma cantidad a una idéntica). Devuelve el carrito completo. */
  addItem: (body: AddCartItemRequest): Promise<CartResponse> =>
    authFetcher<CartResponse>("/cart/items", { method: "POST", body: JSON.stringify(body) }),
};
