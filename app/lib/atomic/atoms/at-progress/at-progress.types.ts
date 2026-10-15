import { ReactNode } from "react";

import { ProgressProps } from "@heroui/react";

/**
 * Barra de progreso del Figma ("Pedido en curso"): alto 10,5, pista `track`,
 * relleno `accent`, píldora. Exige `label` visible o `aria-label`.
 */
export type AtProgressProps = Omit<ProgressProps, "label" | "aria-label"> & {
  /** La barra se llena desde 0 hasta su valor al montar (480 ms). Sin efecto con movimiento reducido. */
  fillOnMount?: boolean;
  /**
   * Proceso en marcha (p. ej. pedido en camino): un brillo recorre la barra cada 2 s mientras se ve.
   * Sin brillo con movimiento reducido.
   */
  isLive?: boolean;
} & ({ label: ReactNode; "aria-label"?: string } | { label?: never; "aria-label": string });
