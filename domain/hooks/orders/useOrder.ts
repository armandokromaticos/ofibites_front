import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

/** Clave de un pedido de la empresa activa. `useCheckout` la siembra con la respuesta de `POST /orders/checkout`. */
export const orderQueryKey = (companyId: string | null, orderId: string) => ["order", companyId, orderId] as const;

/** Un pedido (`GET /orders/:id`, con `X-Company-Id`). Un 403 o 404 no mejoran al reintentar. */
export function useOrder(orderId: string) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: orderQueryKey(companyId, orderId),
    queryFn: () => orderService.get(orderId),
    enabled: Boolean(companyId && orderId),
    staleTime: 60_000,
    retry: false,
  });
}
