"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { MemberStatus } from "@/domain/models";

/** `?estado=`: grupo de estado de "Administración de usuarios". Sin valor = "Todos". */
const ESTADOS: readonly MemberStatus[] = ["active", "pending", "inactive"];

/** `?orden=`: el Figma solo muestra "Nombre" cerrado; se añade "Última conexión" como segunda opción razonable. */
export type OrdenMiembros = "nombre" | "conexion";
const ORDENES: readonly OrdenMiembros[] = ["nombre", "conexion"];
const ORDEN_POR_DEFECTO: OrdenMiembros = "nombre";
const MAX_BUSQUEDA = 100;

export interface FiltrosAdministracion {
  /** `?estado=`. Sin valor = "Todos". */
  estado?: MemberStatus;
  orden: OrdenMiembros;
  /** `?q=`: nombre o correo (se filtra en cliente). */
  q: string;
  /** `?pagina=`, desde 1. */
  pagina: number;
}

export function leerFiltrosAdministracion(params: URLSearchParams): FiltrosAdministracion {
  const estadoRaw = params.get("estado");
  const estado = ESTADOS.find((valor) => valor === estadoRaw);
  const ordenRaw = params.get("orden");
  const orden = ORDENES.find((valor) => valor === ordenRaw) ?? ORDEN_POR_DEFECTO;
  const paginaRaw = Number(params.get("pagina"));

  return {
    estado,
    orden,
    q: (params.get("q") ?? "").trim().slice(0, MAX_BUSQUEDA),
    pagina: Number.isInteger(paginaRaw) && paginaRaw > 1 ? paginaRaw : 1,
  };
}

function escribir(params: URLSearchParams, clave: string, valor: string | undefined) {
  if (valor) params.set(clave, valor);
  else params.delete(clave);
}

/**
 * Filtros de "Administración de usuarios" en la URL (mismo patrón que `use-filtros-pedidos.ts`, T-28b):
 * `history.replaceState`, sin petición al servidor ni entrada nueva en el historial por cada cambio.
 */
export function useFiltrosAdministracion() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filtros = useMemo(
    () => leerFiltrosAdministracion(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const actualizar = useCallback(
    (cambios: Partial<FiltrosAdministracion>) => {
      const params = new URLSearchParams(window.location.search);
      if ("estado" in cambios) escribir(params, "estado", cambios.estado);
      if (cambios.orden) escribir(params, "orden", cambios.orden === ORDEN_POR_DEFECTO ? undefined : cambios.orden);
      if (cambios.q !== undefined) escribir(params, "q", cambios.q.trim());

      const cambiaFiltros = Object.keys(cambios).some((clave) => clave !== "pagina");
      if (cambios.pagina !== undefined) {
        escribir(params, "pagina", cambios.pagina > 1 ? String(cambios.pagina) : undefined);
      } else if (cambiaFiltros) {
        params.delete("pagina");
      }

      const query = params.toString();
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [pathname],
  );

  return { filtros, actualizar };
}
