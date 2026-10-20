import { useQuery } from "@tanstack/react-query";

import { departmentService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const departmentsQueryKey = (companyId: string | null) => ["departments", companyId] as const;

/** Departamentos de la empresa activa (`GET /companies/:id/departments`), para resolver `Order.departmentId`. */
export function useDepartments() {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: departmentsQueryKey(companyId),
    queryFn: () => departmentService.list(companyId as string),
    enabled: Boolean(companyId),
    staleTime: 60_000,
    retry: false,
  });
}
