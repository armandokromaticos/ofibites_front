import { useMutation } from "@tanstack/react-query";

import { cartService } from "@/domain/services";

import { useCartMutationOptions } from "./cart-mutation";

/** Fila común de las escrituras del cupón: aplicar y quitar no se cruzan (gana la última pedida). */
const CART_COUPON_SCOPE = { id: "cart-coupon" } as const;

/**
 * `POST /cart/coupon` con el código escrito. La respuesta (carrito completo, con `coupon` y `summary.discount` del
 * servidor) sustituye la caché de `useCart`. Un 400 trae en `message` el motivo en español, listo para mostrar.
 */
export function useApplyCoupon() {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    scope: CART_COUPON_SCOPE,
    mutationFn: (code: string) => cartService.applyCoupon({ code }),
    onSuccess: saveCart,
  });
}

/** `DELETE /cart/coupon`. La respuesta (carrito sin cupón) sustituye la caché de `useCart`. */
export function useRemoveCoupon() {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    scope: CART_COUPON_SCOPE,
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: saveCart,
  });
}
