import { ReactNode } from "react";

import { ButtonProps } from "@heroui/react";

/**
 * Botón de solo icono de la top bar (carrito, campana): 40 × 40, fondo blanco,
 * borde `border-subtle`, radio 12 e icono de 20 (lo pasa el caller como `children`).
 *
 * `aria-label` es obligatorio: sin texto visible es el único nombre accesible.
 * Si hay `badgeContent`, incluye el número en el `aria-label` (p. ej. "Carrito, 3 productos").
 */
export type AtIconButtonProps = Omit<ButtonProps, "isIconOnly" | "aria-label"> & {
  "aria-label": string;
  /** Contador opcional sobre el botón (p. ej. productos en el carrito). Se oculta si es 0 o vacío. */
  badgeContent?: ReactNode;
  /**
   * Pulso ("ping") alrededor del badge al aparecer: tres pulsos y se detiene. Para avisos nuevos
   * (notificaciones sin leer), no para contadores. Sin pulso con movimiento reducido.
   */
  badgePing?: boolean;
};
