import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { UpdateCompanyFiscalDataRequest } from "@/domain/types";

import { companyQueryKey } from "./useCompany";

/** `PATCH /companies/:companyId/fiscal-data` (T-34a): la respuesta reemplaza la empresa en caché. */
export function useUpdateCompanyFiscalData() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationFn: (body: UpdateCompanyFiscalDataRequest) =>
      companyService.updateFiscalData(companyId as string, body),
    onSuccess: (company) => {
      queryClient.setQueryData(companyQueryKey(companyId), company);
    },
  });
}
