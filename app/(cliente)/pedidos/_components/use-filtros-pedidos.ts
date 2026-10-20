"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { ORDER_STATUS_GROUP_FILTERS } from "@/domain/models";
import { OrderStatusGroup } from "@/domain/types";

/** Rango relativo del filtro "Fecha" (Figma: "Últimos 7/30/90 días" o "Todo el tiempo"). */
export type RangoFechaPedidos = "todo" | "7" | "30" | "90";

const RANGOS: readonly RangoFechaPedidos[] = ["todo", "7", "30", "90"];
const RANGO_POR_DEFECTO: RangoFechaPedidos = "30";
const MAX_BUSQUEDA = 100;

/**
 * Filtros de "Pedidos realizados" que viven en la URL (se pueden compartir y recargar). `grupo` usa
 * `?grupo=` (no `?estado=`: ese query ya lo usa el estado de QA de la página, `?estado=cargando|vacio|error`).
 */
export interface FiltrosPedidos {
  /** `?grupo=`: grupo de estado. Sin valor = "Todos" (incluye cancelados). */
  grupo?: OrderStatusGroup;
  /** `?fecha=`. Por defecto "30". */
  fecha: RangoFechaPedidos;
  /** `?sede=`: id de la sede (`Branch`). Sin valor = "Todas". */
  sede?: string;
  /** `?usuario=`: id de quien creó el pedido. Sin valor = "Todos". */
  usuario?: string;
  /** `?q=`: texto libre (número, usuario o producto); se filtra en cliente. */
  q: string;
  /** `?pagina=`, desde 1. */
  pagina: number;
}

export function leerFiltrosPedidos(params: URLSearchParams): FiltrosPedidos {
  const grupoRaw = params.get("grupo");
  const grupo = ORDER_STATUS_GROUP_FILTERS.find((g) => g === grupoRaw);
  const fechaRaw = params.get("fecha");
  const fecha = RANGOS.find((r) => r === fechaRaw) ?? RANGO_POR_DEFECTO;
  const paginaRaw = params.get("pagina");
  const pagina = Number(paginaRaw);

  return {
    grupo,
    fecha,
    sede: params.get("sede") ?? undefined,
    usuario: params.get("usuario") ?? undefined,
    q: (params.get("q") ?? "").trim().slice(0, MAX_BUSQUEDA),
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
  };
}

function escribir(params: URLSearchParams, clave: string, valor: string | undefined) {
  if (valor) params.set(clave, valor);
  else params.delete(clave);
}

/**
 * Filtros de "Pedidos realizados" leídos de la URL y función para cambiarlos, con el mismo patrón de
 * Ordenar (T-19b, `use-filtros-catalogo.ts`): `history.replaceState` (sin petición al servidor ni
 * transición de página ni historial por cada filtro). Cualquier cambio de filtros vuelve a la página 1.
 */
export function useFiltrosPedidos() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filtros = useMemo(
    () => leerFiltrosPedidos(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const actualizar = useCallback(
    (cambios: Partial<FiltrosPedidos>) => {
      const params = new URLSearchParams(window.location.search);
      if ("grupo" in cambios) escribir(params, "grupo", cambios.grupo);
      if (cambios.fecha) escribir(params, "fecha", cambios.fecha === RANGO_POR_DEFECTO ? undefined : cambios.fecha);
      if ("sede" in cambios) escribir(params, "sede", cambios.sede);
      if ("usuario" in cambios) escribir(params, "usuario", cambios.usuario);
      if (cambios.q !== undefined) escribir(params, "q", cambios.q.trim());

      const cambiaFiltros = Object.keys(cambios).some((clave) => clave !== "pagina");
      if (cambios.pagina !== undefined) {
        escribir(params, "pagina", cambios.pagina > 1 ? String(cambios.pagina) : undefined);
      } else if (cambiaFiltros) {
        params.delete("pagina");
      }

      const query = params.toString();
      // `null` y no `history.state`: si se le pasa el estado interno de Next (`__NA`), el router lo trata
      // como suyo y `useSearchParams` no se entera del cambio (tech-rules/tooling, visto en T-19).
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [pathname],
  );

  return { filtros, actualizar };
}
