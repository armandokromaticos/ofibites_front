export interface MlStepIndicatorProps {
  /** Nombres de los pasos, en orden ("Tu empresa", "Tu contacto"...). */
  steps: string[];
  /** Índice del paso actual, empezando en 0. */
  currentStep: number;
  /** Nombre accesible de la lista. Por defecto "Progreso". */
  label?: string;
  className?: string;
}
