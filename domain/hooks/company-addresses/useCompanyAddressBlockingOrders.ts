import { useQuery } from "@tanstack/react-query";

import { companyAddressService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

/**
 * Pedidos en curso que bloquean el borrado de una dirección (T-31a, IMPLEMENTADO): se consulta al abrir el
 * modal de confirmación de "Eliminar sede" (Figma `3659:2271`), no en la lista. `addressId` en `null` (modal
 * cerrado) desactiva la consulta. El `DELETE` sigue siendo el gate real: esto es solo un adelanto en pantalla.
 */
export function useCompanyAddressBlockingOrders(addressId: string | null) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: ["company-addresses", companyId, addressId, "blocking-orders"] as const,
    queryFn: () => companyAddressService.blockingOrders(companyId as string, addressId as string),
    enabled: Boolean(companyId) && Boolean(addressId),
    retry: false,
  });
}
