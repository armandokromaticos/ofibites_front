"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { parseRepetirOrdenar } from "../../_navegacion";

/** Filtro de lista en la URL (`?filtro=`): sin valor = "Todo". */
export type FiltroLista = "todo" | "oferta" | "nuevos";

/** Estado de Ordenar que vive en la URL (se puede compartir y recargar). */
export interface FiltrosCatalogo {
  /** `?categoria=<slug>` de la sección del catálogo. Sin valor = "Todos". */
  categoria?: string;
  /** `?tags=a,b`: ids de las preferencias marcadas. */
  tags: string[];
  /** `?filtro=nuevos|oferta`. */
  filtro: FiltroLista;
  /** `?q=`: texto de búsqueda (se envía a la API con ≥ 2 caracteres). */
  q: string;
  /** `?pagina=`, desde 1. */
  pagina: number;
  /** `?repetir=<orderId>` ("Repetir" del dashboard). */
  repetir?: string;
  /** Parámetros de filtro con un valor que el catálogo rechazaría: se ignoran y se quitan de la URL. */
  invalidos: string[];
}

/** Lo que identifica un estado de filtros (sin `?repetir=` ni `invalidos`). */
export function firmaFiltros(
  filtros: Pick<FiltrosCatalogo, "categoria" | "tags" | "filtro" | "q" | "pagina">,
): string {
  const tags = [...filtros.tags].sort().join(",");
  return [filtros.categoria ?? "", tags, filtros.filtro, filtros.q, filtros.pagina].join("|");
}

// Mismas reglas que el back (T-19a): slug "coffee-break" y tags UUID (@IsUUID), hasta 20.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TAGS = 20;
const MAX_BUSQUEDA = 100;

/** Lee y sanea los filtros de la URL: un valor inválido se ignora y se anota en `invalidos`. */
export function leerFiltros(params: URLSearchParams): FiltrosCatalogo {
  const invalidos: string[] = [];
  const categoriaRaw = params.get("categoria");
  const filtroRaw = params.get("filtro");
  const paginaRaw = params.get("pagina");
  const tagsRaw = params.get("tags");
  const pagina = Number(paginaRaw);
  const tags = (tagsRaw ?? "").split(",").filter(Boolean);

  const categoria =
    categoriaRaw && categoriaRaw.length <= 80 && SLUG.test(categoriaRaw) ? categoriaRaw : undefined;
  if (categoriaRaw !== null && !categoria) invalidos.push("categoria");
  const filtro = filtroRaw === "oferta" || filtroRaw === "nuevos" ? filtroRaw : "todo";
  if (filtroRaw !== null && filtro === "todo") invalidos.push("filtro");
  if (paginaRaw !== null && !(Number.isInteger(pagina) && pagina >= 1)) invalidos.push("pagina");
  const tagsValidos = tags.filter((tag) => UUID.test(tag)).map((tag) => tag.toLowerCase());
  const tagsMal = tags.length === 0 || tags.length > MAX_TAGS || tagsValidos.length !== tags.length;
  if (tagsRaw !== null && tagsMal) {
    invalidos.push("tags");
  }

  return {
    categoria,
    tags: [...new Set(tagsValidos)].slice(0, MAX_TAGS),
    filtro,
    q: (params.get("q") ?? "").trim().slice(0, MAX_BUSQUEDA),
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
    repetir: parseRepetirOrdenar(params.get("repetir") ?? undefined),
    invalidos,
  };
}

function escribir(params: URLSearchParams, clave: string, valor: string | undefined) {
  if (valor) params.set(clave, valor);
  else params.delete(clave);
}

/**
 * Filtros de Ordenar leídos de la URL y función para cambiarlos. Escribe con `history.replaceState`
 * (Next lo sincroniza con `useSearchParams`): sin petición al servidor ni transición de página, y filtrar no
 * llena el historial. Cualquier cambio de filtros vuelve a la página 1. Conserva los parámetros que no son
 * suyos (p. ej. `?estado=` de QA).
 */
export function useFiltrosCatalogo() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filtros = useMemo(
    () => leerFiltros(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const actualizar = useCallback(
    (cambios: Partial<FiltrosCatalogo>) => {
      const params = new URLSearchParams(window.location.search);
      if ("categoria" in cambios) escribir(params, "categoria", cambios.categoria);
      if (cambios.tags) escribir(params, "tags", cambios.tags.join(","));
      if (cambios.filtro) escribir(params, "filtro", cambios.filtro === "todo" ? undefined : cambios.filtro);
      if (cambios.q !== undefined) escribir(params, "q", cambios.q.trim());
      if ("repetir" in cambios) escribir(params, "repetir", cambios.repetir);

      const cambiaFiltros = Object.keys(cambios).some((clave) => clave !== "repetir" && clave !== "pagina");
      if (cambios.pagina !== undefined) {
        escribir(params, "pagina", cambios.pagina > 1 ? String(cambios.pagina) : undefined);
      } else if (cambiaFiltros) {
        params.delete("pagina");
      }

      const query = params.toString();
      // `null` y no `history.state`: si se le pasa el estado interno de Next (`__NA`), el router lo trata
      // como suyo y `useSearchParams` no se entera del cambio.
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [pathname],
  );

  return { filtros, actualizar };
}
