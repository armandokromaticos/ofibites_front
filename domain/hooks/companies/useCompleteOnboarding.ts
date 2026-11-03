import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ME_QUERY_KEY } from "@/domain/hooks/auth/useMe";
import { companyService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { Company, MeResponse } from "@/domain/types";

import { companyQueryKey } from "./useCompany";

/**
 * `POST /companies/:companyId/onboarding/complete` (T-34a). Al terminar marca la membresía activa como completada
 * en la sesión y en la caché de `/auth/me` (para que la guarda de `(cliente)` no devuelva al onboarding antes de
 * que llegue el `/auth/me` nuevo) e invalida `/auth/me` y la empresa.
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const markOnboardingCompleted = useAuthStore((state) => state.markOnboardingCompleted);

  return useMutation({
    mutationFn: () => companyService.completeOnboarding(companyId as string),
    onSuccess: ({ onboardingCompletedAt }) => {
      if (!companyId) return;
      markOnboardingCompleted(companyId, onboardingCompletedAt);
      queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, (me) =>
        me
          ? {
              ...me,
              memberships: me.memberships.map((m) =>
                m.companyId === companyId ? { ...m, onboardingCompletedAt } : m,
              ),
            }
          : me,
      );
      queryClient.setQueryData<Company>(companyQueryKey(companyId), (company) =>
        company ? { ...company, onboardingCompletedAt } : company,
      );
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}
