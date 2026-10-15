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
  /** Si se pasa, aparece "Cerrar sesión" al pie, sobre el usuario. */
  onLogout?: () => void;
  /** Cierre de sesión en curso: el botón no responde y lo anuncia. */
  isLoggingOut?: boolean;
  /** id del `<nav>` (para `aria-controls` del botón de menú). Por defecto "app-sidebar-nav". */
  navId?: string;
  /**
   * Nombre de View Transition del logo. Por defecto el del logo de las pantallas de acceso (tras el
   * login, el logo viaja hasta aquí). `null` = sin nombre: úsalo si hay más de un sidebar en
   * pantalla (p. ej. el catálogo `/dev/ui`), porque un nombre solo puede estar una vez.
   */
  logoTransitionName?: string | null;
  className?: string;
}
