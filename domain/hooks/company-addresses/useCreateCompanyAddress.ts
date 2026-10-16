import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyAddressService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CompanyAddress, CreateCompanyAddressRequest } from "@/domain/types";

import { companyAddressesQueryKey } from "./useCompanyAddresses";

/**
 * `POST /companies/:id/addresses` (solo COMPANY_ADMIN). La dirección nueva entra en la caché de la agenda al
 * instante y luego se vuelve a pedir la lista.
 */
export function useCreateCompanyAddress() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationFn: (body: CreateCompanyAddressRequest) =>
      companyAddressService.create(companyId as string, body),
    onSuccess: (address) => {
      queryClient.setQueryData<CompanyAddress[]>(companyAddressesQueryKey(companyId), (list) =>
        list ? [...list, address] : [address],
      );
      return queryClient.invalidateQueries({ queryKey: companyAddressesQueryKey(companyId) });
    },
  });
}
