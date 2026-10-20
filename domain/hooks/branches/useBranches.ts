import { useQuery } from "@tanstack/react-query";

import { branchService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const branchesQueryKey = (companyId: string | null) => ["branches", companyId] as const;

/** Sedes de la empresa activa (`GET /companies/:id/branches`), para resolver `Order.branchId` a un nombre. */
export function useBranches() {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: branchesQueryKey(companyId),
    queryFn: () => branchService.list(companyId as string),
    enabled: Boolean(companyId),
    staleTime: 60_000,
    retry: false,
  });
}
