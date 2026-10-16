import { useQuery } from "@tanstack/react-query";

import { companyAddressService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const companyAddressesQueryKey = (companyId: string | null) => ["company-addresses", companyId] as const;

/** Agenda de direcciones de la empresa activa (`GET /companies/:id/addresses`). */
export function useCompanyAddresses() {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: companyAddressesQueryKey(companyId),
    queryFn: () => companyAddressService.list(companyId as string),
    enabled: Boolean(companyId),
    retry: false,
  });
}
