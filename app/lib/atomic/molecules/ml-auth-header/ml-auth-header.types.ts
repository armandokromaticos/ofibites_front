import { ReactNode, Ref } from "react";

export interface MlAuthHeaderProps {
  /** Título de la pantalla (h1, Playfair Black 41 `brand`, centrado). */
  title: string;
  /** Subtítulo (Inter Semibold 16-17, centrado). */
  subtitle?: ReactNode;
  /** Elemento sobre el título (p. ej. la ilustración de éxito). */
  icon?: ReactNode;
  /** Ref al h1. Si se pasa, el h1 recibe `tabIndex={-1}` para poder llevarle el foco. */
  titleRef?: Ref<HTMLHeadingElement>;
  className?: string;
}
