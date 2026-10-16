import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { catalogService } from "@/domain/services";
import { CatalogQuery } from "@/domain/types";
import { isApiError } from "@/shared/utils";

import { conEstadoQaCatalogo, EstadoQaCatalogo } from "./estado-qa";

export const CATALOG_QUERY_KEY = ["catalog"] as const;

interface UseCatalogOptions {
  /** Fuerza un estado de QA (solo desarrollo, lo filtra `app/(cliente)/ordenar/page.tsx`). */
  qaState?: EstadoQaCatalogo;
}

/** Catálogo de Ordenar (`GET /catalog`). La clave incluye los filtros; al cambiarlos se sigue viendo la página anterior. */
export function useCatalog(query: CatalogQuery, { qaState }: UseCatalogOptions = {}) {
  return useQuery({
    queryKey: [...CATALOG_QUERY_KEY, query, qaState ?? "real"],
    queryFn: conEstadoQaCatalogo(query, qaState, () => catalogService.get(query)),
    placeholderData: keepPreviousData,
    // Un 4xx (sección inexistente, parámetro inválido) no mejora al reintentar.
    retry: (failureCount, error) =>
      !(isApiError(error) && error.statusCode >= 400 && error.statusCode < 500) && failureCount < 1,
    ...(qaState && { gcTime: 0, staleTime: 0 }),
  });
}
