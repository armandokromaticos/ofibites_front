import { useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CheckoutRequest, Order } from "@/domain/types";

import { orderQueryKey } from "../orders/useOrder";

/**
 * Ventana hacia atrás desde la búsqueda: el último minuto más lo que pudo tardar la petición fallida (timeout del
 * fetcher) y el desfase de relojes entre cliente y servidor.
 */
const VENTANA_MS = 2 * 60_000;

/**
 * Tras un fallo incierto del checkout (red, 408 o 5xx: el pedido pudo crearse), busca en `GET /orders` un pedido
 * del usuario creado hace menos de dos minutos con esa misma entrega (sede, fecha y hora). Si lo encuentra,
 * siembra su caché y lo devuelve; si no (o si `GET /orders` también falla), `null`.
 */
export function useFindCheckoutOrder() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return async (body: CheckoutRequest): Promise<Order | null> => {
    const orders = await orderService.list().catch(() => [] as Order[]);
    const desde = Date.now() - VENTANA_MS;
    const pedido =
      orders.find(
        (order) =>
          new Date(order.createdAt).getTime() >= desde &&
          (order.createdById === userId || order.userId === userId) &&
          order.deliveryAddressId === body.deliveryAddressId &&
          order.deliveryDate?.slice(0, 10) === body.deliveryDate &&
          order.deliveryTime === body.deliveryTime,
      ) ?? null;
    if (pedido) queryClient.setQueryData(orderQueryKey(companyId, pedido.id), pedido);
    return pedido;
  };
}
