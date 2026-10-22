import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyMemberService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CompanyMember, InviteCompanyMemberRequest } from "@/domain/types";

import { companyMembersQueryKey } from "./useCompanyMembers";

/** `POST /companies/:companyId/members/invite` ("Añadir usuario"): crea el `User` y envía la invitación. */
export function useInviteCompanyMember() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationKey: ["company-members", "invite"],
    mutationFn: (body: InviteCompanyMemberRequest) =>
      companyMemberService.invite(companyId as string, body),
    onSuccess: (member) => {
      queryClient.setQueryData<CompanyMember[]>(companyMembersQueryKey(companyId), (list) =>
        list ? [...list, member] : [member],
      );
      return queryClient.invalidateQueries({ queryKey: companyMembersQueryKey(companyId) });
    },
  });
}
