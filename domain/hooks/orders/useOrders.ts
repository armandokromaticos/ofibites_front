import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

import { conEstadoQaPedidos, EstadoQaPedidos } from "./estado-qa";

export const ordersQueryKey = (companyId: string | null) => ["orders", companyId] as const;

interface UseOrdersOptions {
  /** Fuerza un estado de QA (solo desarrollo, lo filtra `app/(cliente)/pedidos/page.tsx`). */
  qaState?: EstadoQaPedidos;
}

/**
 * Pedidos de la empresa activa (`GET /orders`, con `X-Company-Id`). El back ya soporta filtros y
 * paginación por query (T-28a, IMPLEMENTADO), pero este hook los pide todos: "Pedidos realizados"
 * filtra, busca y pagina en cliente sobre el resultado completo, por decisión de alcance (ver
 * DECISIONES 2026-10-20 · T-28b — el filtro "Usuario" necesita ver todos los nombres cargados).
 */
export function useOrders({ qaState }: UseOrdersOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [...ordersQueryKey(companyId), qaState ?? "real"],
    queryFn: conEstadoQaPedidos(qaState, () => orderService.list()),
    enabled: Boolean(companyId),
    ...(qaState && { gcTime: 0, staleTime: 0 }),
  });
}
