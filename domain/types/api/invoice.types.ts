// Facturas y pagos del cliente (T-06): `/api/invoices…`, `invoice` de `OrderResponseDto` e `invoiceAlert`/`creditLine`
// del carrito. Alineado con el contrato "Facturas y pagos del cliente" (gestion/CONTRATOS-API.md, IMPLEMENTADO) y con
// `src/core/application/dto/invoices/invoice-response.dto.ts` del back.

/** Estado guardado de la factura. */
export type InvoiceStatus = "PENDING" | "PAID" | "VOID";

/**
 * Estado de pago **derivado** que calcula el back (precedencia: PAID · VOID · IN_REVIEW · OVERDUE · REJECTED ·
 * PENDING). Es el que deciden chips y acciones.
 */
export type InvoicePaymentStatus = "PAID" | "VOID" | "IN_REVIEW" | "OVERDUE" | "REJECTED" | "PENDING";

/** Estado de un registro de pago (comprobante). No confundir con el derivado. */
export type InvoicePaymentRecordStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";

/** Métodos admitidos (sin "Otro"). La etiqueta en español la pone el front (`PAYMENT_METHOD_LABELS`). */
export type PaymentMethod = "MOBILE_PAYMENT" | "TRANSFER_VES" | "TRANSFER_USD" | "ZELLE";

export interface InvoicePaymentProof {
  fileName: string;
  /** `image/jpeg`, `image/png` o `application/pdf`. */
  mimeType: string;
  sizeBytes: number;
}

/** Registro de pago (`latestPayment` y cada elemento de `payments`). */
export interface InvoicePayment {
  id: string;
  status: InvoicePaymentRecordStatus;
  method: PaymentMethod;
  bank: string | null;
  reference: string;
  /** USD, como la factura. */
  amount: number;
  /** Fecha pura (medianoche UTC): se lee con `dateOnlyFromApi`, sin convertir zona. */
  paymentDate: string;
  /** Instante ISO. */
  submittedAt: string;
  submittedBy: { id: string; name: string };
  /** Instante ISO. El revisor no se expone: se muestra "Finanzas Ofibites". */
  reviewedAt: string | null;
  rejectionReason: string | null;
  proof: InvoicePaymentProof;
}

/** `Order.invoice`: `null` sin confirmar, sin factura (anterior a T-06) o para `OPERATOR`. */
export interface OrderInvoice {
  id: string;
  /** Número de la proforma, `F-AAAA-NNNN`. */
  invoiceNumber: string;
  status: InvoiceStatus;
  paymentStatus: InvoicePaymentStatus;
  /** Instante ISO. */
  issuedAt: string;
  /** Fecha pura (medianoche UTC). */
  dueDate: string;
  creditDays: number;
  /** `creditDays > 0`. */
  isCredit: boolean;
  isOverdue: boolean;
  /** Días hasta el vencimiento (negativo si vencida); `null` si `PAID` o `VOID`. */
  daysUntilDue: number | null;
  total: number;
  amountPaid: number;
  balance: number;
  paidAt: string | null;
  /** "Descargar factura" baja la fiscal si es `true`; si no, la proforma. */
  hasFiscalPdf: boolean;
  /** Número de la factura fiscal si Ofibites lo dio; el front rotula "Factura <fiscalNumber ?? invoiceNumber>". */
  fiscalNumber: string | null;
  latestPayment: InvoicePayment | null;
}

/** `GET /invoices/:id` y respuestas de pagos: la factura con el pedido, la facturación y todo el historial. */
export interface InvoiceResponse extends OrderInvoice {
  orderId: string;
  orderNumber: string | null;
  companyId: string;
  companyName: string | null;
  billing: { name: string; taxId: string; address: string | null };
  /** Todos los registros, `submittedAt` desc. */
  payments: InvoicePayment[];
}

/** Body de `POST /invoices/:id/payments` (se envía como `multipart/form-data`). */
export interface SubmitInvoicePaymentRequest {
  /** `YYYY-MM-DD`, no posterior a hoy (Caracas). */
  paymentDate: string;
  method: PaymentMethod;
  /** ≤ 100. */
  bank?: string;
  /** 1–60. */
  reference: string;
  /** USD, > 0 con hasta 2 decimales y ≤ `balance`. */
  amount: number;
  /** JPG, PNG o PDF, ≤ 5 MB. */
  file: File;
  /** El `PENDING_REVIEW` que sustituye ("Enviar otro comprobante"), en la misma transacción. */
  replacesPaymentId?: string;
}

/** Línea de crédito de la empresa (`GET /invoices/credit-line`). */
export interface CreditLine {
  creditDays: number;
  /** `null` = sin tope. */
  creditLimit: number | null;
  /** Saldo de las facturas `PENDING`. */
  committed: number;
  /** `max(0, creditLimit − committed)`, o `null` sin tope. */
  available: number | null;
  /** Hay alguna factura vencida: el front muestra $0 disponible. */
  isBlocked: boolean;
}

/** `GET /invoices/credit-line`: con envoltorio porque Nest manda un `null` como cuerpo vacío. */
export interface CreditLineResponse {
  /** `null` si la empresa es de contado. */
  creditLine: CreditLine | null;
}

/** Factura que resume el aviso del carrito. */
export interface CartInvoiceAlertInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  orderNumber: string | null;
  balance: number;
  /** Fecha pura. */
  dueDate: string;
  daysUntilDue: number;
  paymentStatus: InvoicePaymentStatus;
}

/** `CartResponse.invoiceAlert`: `OVERDUE` (la más antigua, bloquea) o `DUE_SOON` (vence en 0–3 días, no bloquea). */
export interface CartInvoiceAlert {
  level: "OVERDUE" | "DUE_SOON";
  /** `true` solo con `OVERDUE`. */
  blocksCheckout: boolean;
  /** Facturas en ese nivel. */
  count: number;
  invoice: CartInvoiceAlertInvoice;
}

/** `CartResponse.creditLine`: la línea de crédito más si el total del carrito supera lo disponible. */
export interface CartCreditLine extends CreditLine {
  /** `summary.total > available`; `false` sin tope. */
  exceedsAvailable: boolean;
}

/** Factura vencida del 400 `INVOICE_OVERDUE` del checkout. */
export interface OverdueInvoiceSummary {
  id: string;
  orderId: string;
  invoiceNumber: string;
  orderNumber: string | null;
  balance: number;
  dueDate: string;
}
