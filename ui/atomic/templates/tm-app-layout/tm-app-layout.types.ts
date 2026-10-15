import { ReactNode } from "react";

import { OrAppSidebarProps } from "@/ui/atomic/organisms";

export interface TmAppLayoutTopBarAction {
  /** Si se pasa, el botón es un enlace. */
  href?: string;
  onPress?: () => void;
  /** Contador del badge. 0 o vacío lo oculta. */
  count?: number;
}

export interface TmAppLayoutProps {
  /** Props del sidebar (ítems, ítem activo, abierto/cerrado, usuario). */
  sidebar: OrAppSidebarProps;
  /** Título de la página en la top bar ("Dashboard"). Se pinta como `<h1>`. */
  title: string;
  /** Icono de 18 px junto al título (decorativo). */
  titleIcon?: ReactNode;
  /** Botón del carrito. Sin valor no se pinta. */
  cart?: TmAppLayoutTopBarAction;
  /** Botón de notificaciones. Sin valor no se pinta. */
  notifications?: TmAppLayoutTopBarAction;
  children: ReactNode;
  /** Clases del `<main>` (padding, fondo). */
  mainClassName?: string;
  /** Clases del contenedor raíz (p. ej. alto fijo en el catálogo). Por defecto ocupa el viewport. */
  className?: string;
}
