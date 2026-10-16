import { ReactElement, ReactNode } from "react";

import { PopoverProps } from "@heroui/react";

/**
 * Panel flotante anclado a un botón (HeroUI `Popover`): diálogo con foco dentro al abrir, Esc y clic fuera para
 * cerrar y foco de vuelta al botón. Por defecto, bajo el botón y alineado a su derecha (`bottom-end`), 320 px
 * (máx. el ancho de la pantalla menos 32), radio 18, borde y sombra `popover`.
 */
export type AtPopoverProps = Omit<PopoverProps, "children"> & {
  /**
   * Botón que lo abre. Recibe `aria-expanded`, `aria-controls` y el `ref` de anclaje, así que debe pasar sus
   * props al `<button>` (p. ej. `AtIconButton`, `AtButton`).
   */
  trigger: ReactElement;
  children: ReactNode;
  /** Nombre del diálogo para lectores de pantalla (o `aria-labelledby` con el id del título). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Id del panel (el `aria-controls` del botón). */
  panelId?: string;
  /** Clases del panel (sustituyen al ancho, padding...). */
  panelClassName?: string;
};
