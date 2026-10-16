export interface MlOrderTimelineStep {
  label: string;
  /** Ayuda bajo el paso en curso ("Ofibites revisa tu pedido"). */
  hint?: string;
}

export interface MlOrderTimelineProps {
  steps: MlOrderTimelineStep[];
  /**
   * Pasos ya cumplidos (desde el primero). El siguiente es el "en curso" (naranja); con todos cumplidos no hay
   * paso en curso.
   */
  completedCount: number;
  /** Nombre accesible de la lista. Por defecto "Estado del pedido". */
  label?: string;
  className?: string;
}
