import { ReactNode } from "react";

import { ProgressProps } from "@heroui/react";

/**
 * Barra de progreso del Figma ("Pedido en curso"): alto 10,5, pista `track`,
 * relleno `accent`, píldora. Exige `label` visible o `aria-label`.
 */
export type AtProgressProps = Omit<ProgressProps, "label" | "aria-label"> &
  ({ label: ReactNode; "aria-label"?: string } | { label?: never; "aria-label": string });
