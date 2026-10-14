export interface MlQuantityStepperProps {
  /** Valor actual (componente controlado). */
  value: number;
  onChange: (value: number) => void;
  /** Mínimo permitido. Por defecto 1. */
  min?: number;
  /** Máximo permitido. Por defecto 99. */
  max?: number;
  /** Qué se cuenta, para los nombres accesibles ("cantidad", "personas"...). Por defecto "cantidad". */
  label?: string;
  isDisabled?: boolean;
  className?: string;
}
