import { CatalogQuery, CatalogResponse } from "@/domain/types";

/**
 * Estados de QA de Ordenar que se fuerzan con `?estado=` (solo en desarrollo). `error-filtros`: el catálogo
 * sin filtros carga, pero cualquier petición con filtros falla como un error de red.
 */
export type EstadoQaCatalogo = "cargando" | "vacio" | "error" | "error-filtros";

const ESTADOS_QA: readonly EstadoQaCatalogo[] = ["cargando", "vacio", "error", "error-filtros"];

export function parseEstadoQaCatalogo(value: unknown): EstadoQaCatalogo | undefined {
  return ESTADOS_QA.find((estado) => estado === value);
}

/** Estados de QA de la ficha del producto (`?estado=`, solo en desarrollo). El 404 se ve con un id inexistente. */
export type EstadoQaFicha = "cargando" | "error";

const ESTADOS_QA_FICHA: readonly EstadoQaFicha[] = ["cargando", "error"];

export function parseEstadoQaFicha(value: unknown): EstadoQaFicha | undefined {
  return ESTADOS_QA_FICHA.find((estado) => estado === value);
}

// Con `?estado=error` fallan los dos primeros intentos (el automático y el reintento de React Query): el botón
// "Reintentar" de la pantalla de error ya carga. Fuera de ese estado se reinicia, para que volver a él vuelva a fallar.
let intentosConError = 0;

function fallarSiError(estado: string | undefined, que: string) {
  if (estado !== "error") {
    intentosConError = 0;
    return;
  }
  if (intentosConError < 2) {
    intentosConError += 1;
    throw new Error(`Error simulado ${que} (?estado=error)`);
  }
}

/** `queryFn` de `GET /catalog` con el estado de QA aplicado sobre la respuesta real. */
export function conEstadoQaCatalogo(
  query: CatalogQuery,
  estado: EstadoQaCatalogo | undefined,
  pedir: () => Promise<CatalogResponse>,
): () => Promise<CatalogResponse> {
  return async () => {
    if (estado === "cargando") return new Promise<never>(() => {});
    fallarSiError(estado, "del catálogo");
    const conFiltros = Boolean(query.section || query.tags?.length || query.filter || query.search);
    if (estado === "error-filtros" && conFiltros) throw new TypeError("Failed to fetch");

    const respuesta = await pedir();
    if (estado !== "vacio") return respuesta;
    return {
      categories: respuesta.categories.map((categoria) => ({ ...categoria, count: 0 })),
      totalItems: 0,
      preferences: [],
      items: { ...respuesta.items, data: [], total: 0 },
    };
  };
}

/** `queryFn` de la ficha con el estado de QA aplicado antes de la petición real. */
export function conEstadoQaFicha<T>(
  estado: EstadoQaFicha | undefined,
  pedir: () => Promise<T>,
): () => Promise<T> {
  return async () => {
    if (estado === "cargando") return new Promise<never>(() => {});
    fallarSiError(estado, "de la ficha");
    return pedir();
  };
}
