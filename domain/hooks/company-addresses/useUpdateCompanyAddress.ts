import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyAddressService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CompanyAddress, UpdateCompanyAddressRequest } from "@/domain/types";

import { companyAddressesQueryKey } from "./useCompanyAddresses";

/**
 * `PATCH /companies/:id/addresses/:addressId` (solo COMPANY_ADMIN). Actualiza la dirección en la caché de la
 * agenda al instante y luego vuelve a pedir la lista.
 */
export function useUpdateCompanyAddress() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCompanyAddressRequest }) =>
      companyAddressService.update(companyId as string, id, body),
    onSuccess: (address) => {
      queryClient.setQueryData<CompanyAddress[]>(companyAddressesQueryKey(companyId), (list) =>
        list ? list.map((item) => (item.id === address.id ? address : item)) : [address],
      );
      return queryClient.invalidateQueries({ queryKey: companyAddressesQueryKey(companyId) });
    },
  });
}
