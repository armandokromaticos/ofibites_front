import { useMutation } from "@tanstack/react-query";

import { cartService } from "@/domain/services";

import { useCartMutationOptions } from "./cart-mutation";

/** Pedido a repetir: su id, o `"last"` para el último del usuario en la empresa. */
export type RepeatOrderTarget = string | "last";

/**
 * Repetir un pedido en el carrito: `POST /cart/repeat/:orderId` o `POST /cart/repeat/last` copian (en una
 * transacción) las líneas disponibles; no crean pedido. El `cart` de la respuesta sustituye la caché de `useCart`
 * y `skipped` dice qué no se pudo añadir y por qué. Usa `mutateAsync().then()`: quien lo llama suele desmontarse
 * (navega o deja de estar vacío) y los callbacks de `mutate` se perderían.
 */
export function useRepeatOrder() {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    mutationFn: (target: RepeatOrderTarget) =>
      target === "last" ? cartService.repeatLast() : cartService.repeatOrder(target),
    onSuccess: ({ cart }) => saveCart(cart),
  });
}
