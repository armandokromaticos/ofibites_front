import { useQuery } from "@tanstack/react-query";

import { companyMemberService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const companyMemberQueryKey = (companyId: string | null, id: string) => ["company-members", companyId, id] as const;

/** Un miembro de la empresa activa (`GET /companies/:companyId/members/:id`), para "Editar usuario". */
export function useCompanyMember(id: string) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: companyMemberQueryKey(companyId, id),
    queryFn: () => companyMemberService.get(companyId as string, id),
    enabled: Boolean(companyId) && Boolean(id),
  });
}
