import { useMutation } from "@tanstack/react-query";

import { cartService } from "@/domain/services";

import { useCartMutationOptions } from "./cart-mutation";

/** `DELETE /cart` (vaciar). La respuesta (carrito vacío) sustituye la caché de `useCart`. */
export function useClearCart() {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    mutationFn: () => cartService.clear(),
    onSuccess: saveCart,
  });
}
