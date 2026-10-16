import { useMutation } from "@tanstack/react-query";

import { cartService } from "@/domain/services";

import { useCartMutationOptions } from "./cart-mutation";

/**
 * `PATCH /cart/items/:id` (nueva cantidad, ≥ 1) de UNA línea. Los `PATCH` de la misma línea van en fila
 * (`scope`): uno no sale hasta que responde el anterior, así que el último pedido es el último aplicado.
 */
export function useUpdateCartItem(itemId: string) {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    scope: { id: `cart-item:${itemId}` },
    mutationFn: (quantity: number) => cartService.updateItem(itemId, quantity),
    onSuccess: saveCart,
  });
}
