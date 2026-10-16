import { ReactNode } from "react";

import {
  OrAccountMenuProps,
  OrAppSidebarProps,
  OrCartPopoverProps,
  OrNotificationsPopoverProps,
} from "@/ui/atomic/organisms";

export interface TmAppLayoutProps {
  /** Props del sidebar (ítems, ítem activo, abierto/cerrado, usuario). */
  sidebar: OrAppSidebarProps;
  /** Título de la página en la top bar ("Dashboard"). Se pinta como `<h1>`. */
  title: string;
  /** Icono de 18 px junto al título (decorativo). */
  titleIcon?: ReactNode;
  /** Carrito de la top bar (botón con contador + popover "Tu pedido"). Sin valor no se pinta. */
  cart?: OrCartPopoverProps;
  /** Notificaciones de la top bar (campana con punto + popover). Sin valor no se pinta. */
  notifications?: OrNotificationsPopoverProps;
  /**
   * Menú de cuenta del avatar (cabecera con usuario y empresa, opciones y "Cerrar sesión"). Sin valor, la top bar
   * pinta el avatar de `sidebar.user` sin menú.
   */
  account?: OrAccountMenuProps;
  children: ReactNode;
  /** Clases del `<main>` (padding, fondo). */
  mainClassName?: string;
  /** Clases del contenedor raíz (p. ej. alto fijo en el catálogo). Por defecto ocupa el viewport. */
  className?: string;
}
