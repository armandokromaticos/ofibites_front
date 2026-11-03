import { ReactNode } from "react";

/**
 * `split`: login v1 (3236:11719), fondo a pantalla completa y columna centrada de 502 px.
 * `centered`: solicitud de ingreso (3244:12471), una columna centrada de 673 px.
 */
export type TmAuthLayoutVariant = "split" | "centered";

export interface TmAuthLayoutProps {
  children: ReactNode;
  variant?: TmAuthLayoutVariant;
  /** Muestra el logo arriba del contenido. Por defecto `true` (la pantalla de éxito del Figma no lo lleva). */
  showLogo?: boolean;
  /** Fondo a pantalla completa con las ilustraciones ya compuestas (solo `centered`). Sustituye a las sueltas. */
  backgroundSrc?: string;
  /** Clases extra de la columna en `centered` (p. ej. alinear arriba; por defecto 705 px = 673 + gutter). */
  contentClassName?: string;
  className?: string;
}
