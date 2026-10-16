import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/domain/stores";
import { CartResponse } from "@/domain/types";

import { cartQueryKey } from "./useCart";

/** Clave común de todas las escrituras del carrito (popover, página y ficha). */
export const CART_MUTATION_KEY = ["cart"] as const;

/**
 * Opciones compartidas por las mutaciones del carrito:
 * - `onMutate` cancela un `GET /cart` en vuelo (su respuesta llegaría con el estado anterior).
 * - `onSuccess` guarda el carrito de la respuesta (contador y líneas al instante).
 * - `onSettled` vuelve a pedir el carrito solo cuando termina la última escritura en curso: con varias a la vez
 *   (dos líneas, o popover y página) las respuestas pueden llegar desordenadas, y así gana el estado final del
 *   servidor y no la última respuesta en llegar.
 */
export function useCartMutationOptions() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return {
    mutationKey: CART_MUTATION_KEY,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey(companyId) });
    },
    saveCart: (cart: CartResponse | null) => {
      if (cart) queryClient.setQueryData(cartQueryKey(cart.companyId), cart);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: CART_MUTATION_KEY }) === 1) {
        return queryClient.invalidateQueries({ queryKey: cartQueryKey(companyId) });
      }
    },
  };
}
