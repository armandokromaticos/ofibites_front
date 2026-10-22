import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyAddressService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CompanyAddress } from "@/domain/types";

import { companyAddressesQueryKey } from "./useCompanyAddresses";

/**
 * `DELETE /companies/:id/addresses/:addressId` (solo COMPANY_ADMIN). Quita la dirección de la caché de la
 * agenda al instante; el back puede rechazar con 409 si tiene pedidos en curso asociados (T-31a, PENDIENTE),
 * en cuyo caso no se llega a `onSuccess` y la caché no cambia.
 */
export function useDeleteCompanyAddress() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return useMutation({
    mutationFn: (id: string) => companyAddressService.remove(companyId as string, id),
    onSuccess: (_void, id) => {
      queryClient.setQueryData<CompanyAddress[]>(companyAddressesQueryKey(companyId), (list) =>
        list ? list.filter((item) => item.id !== id) : list,
      );
      return queryClient.invalidateQueries({ queryKey: companyAddressesQueryKey(companyId) });
    },
  });
}
