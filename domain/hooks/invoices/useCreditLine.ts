import { useQuery } from "@tanstack/react-query";

import { invoiceService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const creditLineQueryKey = (companyId: string | null) => ["credit-line", companyId] as const;

/**
 * Línea de crédito de la empresa activa (`GET /invoices/credit-line`): cupo, comprometido y disponible para el
 * detalle "a crédito". `data.creditLine` es `null` si la empresa es de contado. Solo se pide si `enabled`.
 */
export function useCreditLine({ enabled = true }: { enabled?: boolean } = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: creditLineQueryKey(companyId),
    queryFn: () => invoiceService.getCreditLine(),
    enabled: enabled && Boolean(companyId),
    staleTime: 60_000,
    retry: false,
  });
}
