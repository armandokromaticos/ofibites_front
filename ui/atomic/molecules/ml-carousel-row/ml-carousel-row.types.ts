import { ReactNode } from "react";

export interface MlCarouselRowProps {
  /** Nombre accesible de la lista ("Recomendaciones"). */
  label: string;
  /** Un nodo por elemento: cada uno va en un `<li>` que no se encoge (el ancho lo pone `itemClassName`). */
  items: ReactNode[];
  /** Clases de cada `<li>` (ancho). Por defecto 300 px, 332 en `sm`. */
  itemClassName?: string;
  className?: string;
}
