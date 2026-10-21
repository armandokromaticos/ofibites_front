import { useMutation } from "@tanstack/react-query";

import { companyMemberService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

/**
 * `POST .../:id/reset-password` (T-29a). Dispara el correo de recuperación para un miembro con cuenta
 * activa (no pendiente). Si el endpoint todavía no existe, el back responde 404 y la UI lo trata como error.
 */
export function useResetMemberPassword() {
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationKey: ["company-members", "reset-password"],
    mutationFn: (id: string) => companyMemberService.resetPassword(companyId as string, id),
  });
}
