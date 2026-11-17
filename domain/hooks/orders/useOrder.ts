import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

import { EscenarioQaPedido, esperaQa, pedidoQa } from "./pedido-qa";

/** Clave de un pedido de la empresa activa. `useCheckout` la siembra con la respuesta de `POST /orders/checkout`. */
export const orderQueryKey = (companyId: string | null, orderId: string) => ["order", companyId, orderId] as const;

interface UseOrderOptions {
  /** Pedido de ejemplo del Figma (solo desarrollo, lo filtra `app/(cliente)/pedidos/[id]/page.tsx`). */
  qa?: EscenarioQaPedido;
}

/** Un pedido (`GET /orders/:id`, con `X-Company-Id`). Un 403 o 404 no mejoran al reintentar. */
export function useOrder(orderId: string, { qa }: UseOrderOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: qa ? [...orderQueryKey(companyId, orderId), "qa", qa] : orderQueryKey(companyId, orderId),
    queryFn: () => (qa ? esperaQa(pedidoQa(qa, orderId)) : orderService.get(orderId)),
    enabled: Boolean(companyId && orderId),
    staleTime: 60_000,
    retry: false,
  });
}
