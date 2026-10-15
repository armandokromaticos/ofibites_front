import { ReactNode } from "react";

export interface TmAuthShowcaseState {
  /** Hay un campo del formulario con el foco: lo que se mueva en la vitrina debe detenerse. */
  paused: boolean;
}

export interface TmAuthShowcaseLayoutProps {
  /** Contenido de la columna del formulario (cabecera, formulario y enlaces). */
  children: ReactNode;
  /**
   * Vitrina decorativa: a la derecha desde `lg` (≈55 % del ancho, alto de la ventana) y como franja
   * sobre el formulario por debajo. Recibe `paused` para detenerse mientras el usuario escribe.
   */
  showcase: (state: TmAuthShowcaseState) => ReactNode;
  className?: string;
}
