import { useMutation } from "@tanstack/react-query";

import { cartService } from "@/domain/services";

import { useCartMutationOptions } from "./cart-mutation";

/**
 * `DELETE /cart/items/:id`. La respuesta (carrito completo) sustituye la caché de `useCart`. Con `itemId` (una
 * línea concreta, como en `/carrito`) comparte fila con sus `PATCH` (`scope`): el borrado espera al cambio de
 * cantidad en vuelo. Sin `itemId` (el resumen de la top bar) quita cualquier línea, sin fila.
 */
export function useRemoveCartItem(itemId?: string) {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    ...(itemId && { scope: { id: `cart-item:${itemId}` } }),
    mutationFn: (id: string) => cartService.removeItem(id),
    onSuccess: saveCart,
  });
}
