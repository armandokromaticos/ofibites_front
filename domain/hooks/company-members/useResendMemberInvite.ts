import { useMutation } from "@tanstack/react-query";

import { companyMemberService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

/** `POST .../:id/resend-invite`: reenvía el correo de invitación. Solo visible para miembros pendientes. */
export function useResendMemberInvite() {
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationKey: ["company-members", "resend-invite"],
    mutationFn: (id: string) => companyMemberService.resendInvite(companyId as string, id),
  });
}
