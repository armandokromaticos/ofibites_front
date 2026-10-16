import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartService } from "@/domain/services";
import { AddCartItemRequest } from "@/domain/types";

import { cartQueryKey } from "./useCart";

/**
 * `POST /cart/items`. La respuesta es el carrito completo de la empresa: se guarda en la caché de `useCart` (clave
 * con su `companyId`) y el contador de la top bar se actualiza sin otra petición.
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddCartItemRequest) => cartService.addItem(body),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey(cart.companyId), cart);
    },
  });
}
