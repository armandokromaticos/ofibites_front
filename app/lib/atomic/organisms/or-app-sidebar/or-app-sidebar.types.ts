import { ReactNode } from "react";

export interface OrAppSidebarItem {
  key: string;
  label: string;
  href: string;
  /** Icono de 20 px (p. ej. de lucide-react). Es decorativo: el nombre accesible es `label`. */
  icon: ReactNode;
  /** Segunda línea en el sidebar abierto ("Panel de control"). */
  description?: string;
}

export interface OrAppSidebarUser {
  name: string;
  /** Rol o cargo bajo el nombre (sidebar abierto). */
  role?: string;
  avatarSrc?: string;
}

export interface OrAppSidebarProps {
  items: OrAppSidebarItem[];
  /** `key` del ítem activo. Sin valor, ningún ítem se marca (variante "Sin selección"). */
  activeKey?: string;
  /** Abierto = 236 px con textos; cerrado = 80 px solo iconos. */
  isOpen: boolean;
  onToggle: () => void;
  user?: OrAppSidebarUser;
  /** Enlace del logo. Por defecto "/". */
  homeHref?: string;
  /** id del `<nav>` (para `aria-controls` del botón de menú). Por defecto "app-sidebar-nav". */
  navId?: string;
  className?: string;
}
