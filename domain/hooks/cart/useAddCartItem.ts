import { useMutation } from "@tanstack/react-query";

import { cartService } from "@/domain/services";
import { AddCartItemRequest } from "@/domain/types";

import { useCartMutationOptions } from "./cart-mutation";

/**
 * `POST /cart/items`. La respuesta es el carrito completo de la empresa: se guarda en la caché de `useCart` y el
 * contador de la top bar se actualiza sin otra petición.
 */
export function useAddCartItem() {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    mutationFn: (body: AddCartItemRequest) => cartService.addItem(body),
    onSuccess: saveCart,
  });
}
