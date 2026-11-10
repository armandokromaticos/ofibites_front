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
 *
 * Ese refetch va en segundo plano (`void`, sin devolver la promesa). Si `onSettled` la devuelve, React Query la
 * espera: la mutación sigue `pending` (y los `onSuccess` de `mutate`/`mutateAsync` no llegan) hasta que responde
 * también `GET /cart`, aunque la respuesta de la escritura ya trae el carrito nuevo. Eso dejaba "Añadir al carrito"
 * en "Añadiendo…" sin aviso de éxito y la línea del carrito en espera (feedback Gaby, P5 y C2).
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
        void queryClient.invalidateQueries({ queryKey: cartQueryKey(companyId) });
      }
    },
  };
}
