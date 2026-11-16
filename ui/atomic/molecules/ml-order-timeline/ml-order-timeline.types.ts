export interface MlOrderTimelineStep {
  label: string;
  /**
   * Ayuda bajo el paso. En `responsive` solo se pinta la del paso en curso ("Ofibites revisa tu pedido"); en
   * `vertical`, la de cualquier paso que la traiga ("Para el 30/09 a las 8:30 a. m.", "Pendiente").
   */
  hint?: string;
}

export interface MlOrderTimelineProps {
  steps: MlOrderTimelineStep[];
  /**
   * Pasos ya cumplidos (desde el primero). El siguiente es el "en curso"; con todos cumplidos no hay paso en curso.
   */
  completedCount: number;
  /** Nombre accesible de la lista. Por defecto "Estado del pedido". */
  label?: string;
  /** Id de un título visible que ya nombra la lista: se usa con `aria-labelledby` en lugar de `label`. */
  labelledBy?: string;
  /**
   * `responsive` (por defecto): barras, en fila desde `sm`. `vertical`: siempre en columna con marcas en círculo
   * (columna lateral estrecha del detalle del pedido).
   */
  orientation?: "responsive" | "vertical";
  className?: string;
}
