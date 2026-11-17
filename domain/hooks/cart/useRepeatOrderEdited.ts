import { useMutation } from "@tanstack/react-query";

import { EscenarioQaRepetir, esperaQa, repetirQa } from "@/domain/hooks/orders/pedido-qa";
import { cartService } from "@/domain/services";
import { RepeatCartSkippedLine, RepeatOrderItemInput } from "@/domain/types";

import { useCartMutationOptions } from "./cart-mutation";

export interface RepeatOrderEditedVariables {
  orderId: string;
  /** Líneas elegidas en el editor con su cantidad final (1–100 líneas, cantidades 1–999). */
  items: RepeatOrderItemInput[];
}

/** Lo que necesita la pantalla tras repetir (el carrito ya queda guardado en la caché de `useCart`). */
export interface RepeatOrderEditedResult {
  added: number;
  skipped: RepeatCartSkippedLine[];
}

/**
 * "Agregar al carrito" del editor "Repetir pedido" (T-38): `POST /cart/repeat/:orderId` con las líneas y cantidades
 * editadas, en una transacción. El `cart` de la respuesta sustituye la caché de `useCart`. Con `qa` (solo desarrollo)
 * simula la respuesta sin tocar el carrito.
 */
export function useRepeatOrderEdited({ qa }: { qa?: EscenarioQaRepetir } = {}) {
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    mutationFn: async (variables: RepeatOrderEditedVariables): Promise<RepeatOrderEditedResult> => {
      const { orderId, items } = variables;
      if (qa) return esperaQa(repetirQa(qa, orderId, { items }));
      const { cart, added, skipped } = await cartService.repeatOrder(orderId, { items });
      saveCart(cart);
      return { added, skipped };
    },
  });
}
