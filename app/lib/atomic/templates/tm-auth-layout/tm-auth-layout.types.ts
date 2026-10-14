import { ReactNode } from "react";

/**
 * `split`: login (3236:11719), columna de 502 px a la izquierda y foto a la derecha desde `lg`.
 * `centered`: solicitud de ingreso (3244:12471), una columna centrada de 673 px.
 */
export type TmAuthLayoutVariant = "split" | "centered";

export interface TmAuthLayoutProps {
  children: ReactNode;
  variant?: TmAuthLayoutVariant;
  /** Muestra el logo arriba del contenido. Por defecto `true` (la pantalla de éxito del Figma no lo lleva). */
  showLogo?: boolean;
  /** Foto del panel derecho en `split` (solo desde `lg`, `object-cover`). Es decorativa. */
  imageSrc?: string;
  className?: string;
}
