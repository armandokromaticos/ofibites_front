import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CartResponse, CheckoutRequest } from "@/domain/types";

import { useCartMutationOptions } from "../cart/cart-mutation";
import { cartQueryKey } from "../cart/useCart";
import { CLIENT_DASHBOARD_QUERY_KEY } from "../dashboard/useClientDashboard";
import { orderQueryKey } from "../orders/useOrder";

/** El carrito tras confirmar: el back lo vacía en la misma transacción que crea el pedido. */
function carritoVacio(cart: CartResponse): CartResponse {
  return {
    ...cart,
    items: [],
    subtotal: 0,
    totalUnits: 0,
    summary: { ...cart.summary, subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 },
  };
}

/**
 * "Confirmar pedido": `POST /orders/checkout` (crea el pedido desde el carrito y lo vacía). Comparte las opciones de
 * las escrituras del carrito (`mutationKey`, cancelar el `GET /cart` en vuelo, volver a pedirlo al terminar) y, al
 * responder, deja la caché del carrito vacía, siembra la del pedido para "Pedido confirmado" y marca el dashboard
 * como desactualizado. Un 409 (carrito o precios cambiados) no guarda nada; `onSettled` vuelve a pedir el carrito. Usa `mutateAsync().then()`: quien lo llama navega al terminar.
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const { saveCart, ...options } = useCartMutationOptions();

  return useMutation({
    ...options,
    mutationFn: (body: CheckoutRequest) => orderService.checkout(body),
    onSuccess: (order) => {
      queryClient.setQueryData(orderQueryKey(companyId, order.id), order);
      const cart = queryClient.getQueryData<CartResponse>(cartQueryKey(companyId));
      saveCart(cart ? carritoVacio(cart) : null);
      void queryClient.invalidateQueries({ queryKey: CLIENT_DASHBOARD_QUERY_KEY });
    },
  });
}
