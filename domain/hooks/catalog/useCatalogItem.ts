import { useQuery } from "@tanstack/react-query";

import { catalogService } from "@/domain/services";
import { CatalogItemKind } from "@/domain/types";
import { isApiError } from "@/shared/utils";

import { conEstadoQaFicha, EstadoQaFicha } from "./estado-qa";
import { CATALOG_QUERY_KEY } from "./useCatalog";

interface UseCatalogItemOptions {
  /** Idioma de los textos (`?lang=`). Sin valor, el del servidor (español). */
  lang?: "es" | "en";
  /** Fuerza un estado de QA (solo desarrollo, lo filtra `app/(cliente)/producto/[id]/page.tsx`). */
  qaState?: EstadoQaFicha;
}

/** Clave de la ficha (la comparten la ficha y las líneas del carrito de la top bar). */
export const catalogItemQueryKey = (
  kind: CatalogItemKind,
  id: string,
  lang?: "es" | "en",
  qaState?: EstadoQaFicha,
) => [...CATALOG_QUERY_KEY, "item", kind, id, lang ?? "es", qaState ?? "real"] as const;

/** Ficha de un producto o combo del catálogo (`GET /catalog/items/:kind/:id`). */
export function useCatalogItem(
  kind: CatalogItemKind,
  id: string,
  { lang, qaState }: UseCatalogItemOptions = {},
) {
  return useQuery({
    queryKey: catalogItemQueryKey(kind, id, lang, qaState),
    queryFn: conEstadoQaFicha(qaState, () => catalogService.getItem(kind, id, lang)),
    // 400 (id inválido) y 404 (inexistente o inactivo) no mejoran al reintentar.
    retry: (failureCount, error) =>
      !(isApiError(error) && error.statusCode >= 400 && error.statusCode < 500) && failureCount < 1,
    ...(qaState && { gcTime: 0, staleTime: 0 }),
  });
}
