import { PaymentMethod } from "@/domain/types";

/** Lo que el modal entrega ya validado. */
export interface OrInvoicePaymentModalValues {
  method: PaymentMethod;
  /** `YYYY-MM-DD`. */
  paymentDate: string;
  reference: string;
  /** USD, con hasta 2 decimales. */
  amount: number;
  /** Vacío → no se envía. */
  bank: string;
  file: File;
}

export interface OrInvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Sin "#" ("001244" u "OF-2026-0107"). */
  orderNumber: string;
  /** Número visible de la factura ("F-2026-0007"). */
  invoiceLabel: string;
  /** Saldo de la factura (`balance`): precarga "Monto (USD)" y es su máximo. */
  balance: number;
  /** `balance` ya formateado ("$420,38"). */
  balanceLabel: string;
  /** "26/10/2026". */
  dueDateLabel: string;
  /** Hoy en Caracas (`YYYY-MM-DD`): la fecha del pago no puede ser posterior. */
  maxPaymentDate: string;
  /** Precarga al reenviar (el método y el banco del comprobante anterior). */
  defaultMethod?: PaymentMethod;
  defaultBank?: string | null;
  /** Aviso sobre el formulario ("El comprobante enviado el 27/09 fue rechazado el 28/09…"). */
  notice?: { tone: "warning" | "danger"; text: string };
  /** Texto del botón de envío. Por defecto "Enviar comprobante". */
  submitLabel?: string;
  onSubmit: (values: OrInvoicePaymentModalValues) => void;
  isSubmitting?: boolean;
  /** Mensaje del back (400/409) tal cual. */
  submitError?: string | null;
}
