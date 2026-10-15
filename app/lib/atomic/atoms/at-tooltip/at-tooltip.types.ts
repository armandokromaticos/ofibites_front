import { TooltipProps } from "@heroui/react";

/**
 * Tooltip de la entrega de diseño (sidebar cerrado): fondo `primary`, texto blanco 12 px semibold,
 * radio 8, padding 6 × 10, a la derecha con 14 px de separación.
 */
export type AtTooltipProps = TooltipProps & {
  /**
   * El texto repite el nombre accesible del disparador (p. ej. un icono con `aria-label` igual):
   * el contenido se oculta a los lectores para que no lo lean dos veces (HeroUI lo enlaza con
   * `aria-describedby`). Por defecto `true`.
   */
  isRedundant?: boolean;
};
