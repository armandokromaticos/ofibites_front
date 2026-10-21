import { useQuery } from "@tanstack/react-query";

import { companyMemberService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export const companyMembersQueryKey = (companyId: string | null) => ["company-members", companyId] as const;

/**
 * Miembros de la empresa activa (`GET /companies/:companyId/members`). Sin paginar ni filtrar en servidor
 * (mismo patrón que `useOrders`/T-28b): "Administración de usuarios" filtra, busca y pagina en cliente.
 */
export function useCompanyMembers() {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: companyMembersQueryKey(companyId),
    queryFn: () => companyMemberService.list(companyId as string),
    enabled: Boolean(companyId),
  });
}
