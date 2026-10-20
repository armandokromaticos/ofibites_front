import { useQuery } from "@tanstack/react-query";

import { toCatalogNames } from "@/domain/adapters";
import { catalogService } from "@/domain/services";

// Mismo límite que el Dashboard (`domain/hooks/dashboard/useClientDashboard.ts`): el máximo `pageSize` de
// `GET /catalog` (48). Un catálogo más grande puede dejar algún producto viejo sin nombre ("Producto").
const CATALOG_PAGE_SIZE = 48;

export const catalogNamesQueryKey = ["catalog-names"] as const;

/**
 * Mapa `kind:id` → nombre de producto/combo, para nombrar las líneas de "Productos del pedido" (el pedido
 * solo trae `productId`/`comboId`, sin nombre; ver `GET /orders/:id` en CONTRATOS-API). Reusa el adapter del
 * Dashboard (`toCatalogNames`, T-04): mismo truco, mismo límite de 48 ítems.
 */
export function useNombresCatalogo() {
  return useQuery({
    queryKey: catalogNamesQueryKey,
    queryFn: () =>
      catalogService
        .get({ pageSize: CATALOG_PAGE_SIZE })
        .then((respuesta) => toCatalogNames(respuesta.items.data)),
    staleTime: 60_000,
    retry: false,
  });
}
