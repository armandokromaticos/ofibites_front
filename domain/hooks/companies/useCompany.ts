import { useQuery } from "@tanstack/react-query";

import { companyService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const companyQueryKey = (companyId: string | null) => ["company", companyId] as const;

/** Empresa activa (`GET /companies/:id`): razón social, RIF y dirección fiscal para la facturación. */
export function useActiveCompany() {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: companyQueryKey(companyId),
    queryFn: () => companyService.get(companyId as string),
    enabled: Boolean(companyId),
    retry: false,
  });
}
