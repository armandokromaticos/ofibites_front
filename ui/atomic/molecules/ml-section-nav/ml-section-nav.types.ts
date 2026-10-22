import { MouseEvent } from "react";

export interface MlSectionNavItem {
  key: string;
  label: string;
  /**
   * Enlace de la sección (p. ej. `/perfil?seccion=contrasena`). Sin valor, la sección sale deshabilitada con
   * "Pronto" (aún no existe), con el mismo criterio que el menú de cuenta (T-25).
   */
  href?: string;
}

export interface MlSectionNavProps {
  items: MlSectionNavItem[];
  /** `key` de la sección activa: lleva `aria-current="page"` y el fondo del Figma. */
  activeKey?: string;
  /**
   * Clic normal en una sección disponible (sin Ctrl/Cmd/Mayús ni botón central). Si se pasa, el enlace no navega
   * y quien lo usa decide (p. ej. cambiar la query sin recargar la página); abrir en otra pestaña sigue funcionando.
   */
  onSelect?: (key: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Nombre accesible del `<nav>` ("Secciones del perfil"). */
  "aria-label": string;
  className?: string;
}
