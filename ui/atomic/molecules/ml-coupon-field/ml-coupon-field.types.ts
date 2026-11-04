/** Cupón ya aplicado, tal como lo devuelve el servidor. */
export interface MlCouponFieldApplied {
  code: string;
  /** 10 = 10 %. Solo se muestra: el descuento en dinero lo calcula el servidor. */
  discountPercent: number;
  /** `false`: el código dejó de valer; se avisa y solo queda quitarlo. */
  isValid: boolean;
}

/**
 * Campo de código promocional del resumen del carrito (Figma 3339:13048). Sin cupón: input + "Aplicar" (Enter
 * también aplica); con cupón: chip del código, porcentaje y "Quitar". No llama a la API: la página pasa el estado de
 * las mutaciones.
 */
export interface MlCouponFieldProps {
  /** Texto del input (controlado). */
  value: string;
  onChange: (value: string) => void;
  /** Se llama con el código sin espacios a los lados; nunca con uno vacío. */
  onApply: (code: string) => void;
  isApplying?: boolean;
  /** Error del servidor al aplicar o quitar, ya en español; se muestra debajo y se anuncia. */
  error?: string | null;
  /** Cupón aplicado, o `null` para mostrar el input. */
  applied: MlCouponFieldApplied | null;
  onRemove: () => void;
  isRemoving?: boolean;
  className?: string;
}
