export interface MlCreditLineCardProps {
  /** Nombre de la empresa ("Andina C.A."), arriba a la derecha. */
  companyName?: string | null;
  /** Ya formateados por el caller ("$3.980,20"): los calcula el servidor. */
  committedLabel: string;
  /** `null` = sin tope: no se pinta la fila (ni la barra). */
  availableLabel: string | null;
  /** `null` = sin tope. */
  limitLabel: string | null;
  /** Fracción comprometida del cupo (0–1) para la barra; `null` sin tope. */
  usedRatio: number | null;
  /** Factura vencida: "Línea de crédito bloqueada", barra y disponible en naranja, "$0 · bloqueado". */
  isBlocked?: boolean;
  /** Nota al pie ("El cupo se libera cuando Finanzas registra el pago de la factura."). */
  note?: string;
  className?: string;
}
