import { ReactNode, Ref } from "react";

export interface MlAuthHeaderProps {
  /** Título de la pantalla (h1, Playfair Black 41 `brand`). */
  title: string;
  /** Subtítulo (Inter Semibold 16-17). */
  subtitle?: ReactNode;
  /** Elemento sobre el título (p. ej. la ilustración de éxito). */
  icon?: ReactNode;
  /** Ref al h1. Si se pasa, el h1 recibe `tabIndex={-1}` para poder llevarle el foco. */
  titleRef?: Ref<HTMLHeadingElement>;
  /** `center` (por defecto, Figma) o `start` (login v2: alineado con el formulario y título de 60 px en lg). */
  align?: "center" | "start";
  /** El título entra animando el peso de Playfair de 400 a 900 (700 ms; sin animación con reduced-motion). */
  animateTitle?: boolean;
  className?: string;
}
