import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyMemberService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CompanyMember, UpdateCompanyMemberRequest } from "@/domain/types";

import { companyMemberQueryKey } from "./useCompanyMember";
import { companyMembersQueryKey } from "./useCompanyMembers";

/**
 * `PATCH /companies/:companyId/members/:id`: editar datos/rol/acceso, o desactivar/reactivar con
 * `{ isActive }` (mismo endpoint, lo decide quien llama). Actualiza la caché de la lista y la del propio
 * miembro (`useCompanyMember`, "Editar usuario") al instante.
 */
export function useUpdateCompanyMember() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationKey: ["company-members", "update"],
    mutationFn: ({ id, body }: { id: string; body: UpdateCompanyMemberRequest }) =>
      companyMemberService.update(companyId as string, id, body),
    onSuccess: (member) => {
      queryClient.setQueryData<CompanyMember[]>(companyMembersQueryKey(companyId), (list) =>
        list ? list.map((item) => (item.id === member.id ? member : item)) : list,
      );
      queryClient.setQueryData<CompanyMember>(companyMemberQueryKey(companyId, member.id), member);
      return queryClient.invalidateQueries({ queryKey: ["company-members", companyId] });
    },
  });
}
