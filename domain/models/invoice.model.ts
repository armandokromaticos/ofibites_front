import {
  InvoicePaymentRecordStatus,
  InvoicePaymentStatus,
  Membership,
  OrderInvoice,
  PaymentMethod,
} from "@/domain/types";

/** Tono visual de un estado de pago (lo traduce a colores `AtStatusChip` / `MlStatusNote`). */
export type PaymentTone = "success" | "warning" | "danger" | "neutral";

export interface PaymentStatusView {
  label: string;
  tone: PaymentTone;
}

/** Etiquetas de los métodos (el back solo manda el enum). Orden del selector del formulario de pago. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  MOBILE_PAYMENT: "Pago Móvil",
  TRANSFER_VES: "Transferencia en Bs",
  TRANSFER_USD: "Transferencia en divisas",
  ZELLE: "Zelle",
};

export const PAYMENT_METHODS: readonly PaymentMethod[] = ["MOBILE_PAYMENT", "TRANSFER_VES", "TRANSFER_USD", "ZELLE"];

/**
 * Columna PAGO de "Pedidos realizados" (Figma `3562:1180` solo dibuja "Pendiente" y "Completado"; acordado en T-06b):
 * `PAID` → Completado, `VOID` → Anulada y el resto → Pendiente.
 */
export function paymentStatusListView(status: InvoicePaymentStatus): PaymentStatusView {
  if (status === "PAID") return { label: "Completado", tone: "success" };
  if (status === "VOID") return { label: "Anulada", tone: "neutral" };
  return { label: "Pendiente", tone: "danger" };
}

/** Chip de pago del detalle del pedido (Figma `3632:1686`, `3634:1842`, `3628:1608`, `3724:3013`, `3726:3051`). */
export function paymentStatusDetailView(invoice: Pick<OrderInvoice, "paymentStatus" | "isCredit">): PaymentStatusView {
  switch (invoice.paymentStatus) {
    case "PAID":
      return { label: "Pago completado", tone: "success" };
    case "IN_REVIEW":
      return { label: "Pago por confirmar", tone: "warning" };
    case "REJECTED":
      return { label: "Comprobante rechazado", tone: "danger" };
    case "OVERDUE":
      return { label: "Vencida", tone: "danger" };
    case "VOID":
      return { label: "Anulada", tone: "neutral" };
    default:
      return invoice.isCredit ? { label: "A crédito", tone: "warning" } : { label: "Pago pendiente", tone: "danger" };
  }
}

/** Chip de un comprobante (modal "Comprobante de pago" y vista ampliada). */
export const PAYMENT_RECORD_STATUS_VIEW: Record<InvoicePaymentRecordStatus, PaymentStatusView> = {
  PENDING_REVIEW: { label: "En revisión", tone: "warning" },
  APPROVED: { label: "Validado", tone: "success" },
  REJECTED: { label: "Rechazado", tone: "danger" },
  WITHDRAWN: { label: "Cancelado", tone: "neutral" },
};

/** Quién reporta pagos (contrato T-06, punto 3): `COMPANY_ADMIN` o `canPayInvoices` en la empresa activa. */
export function canReportPayments(membership: Pick<Membership, "role" | "canPayInvoices" | "isActive"> | null | undefined): boolean {
  if (!membership || membership.isActive === false) return false;
  return membership.role === "COMPANY_ADMIN" || membership.canPayInvoices;
}

/** La factura admite un pago nuevo ("Pagar factura"): `PENDING`, `REJECTED` u `OVERDUE`. */
export function isInvoicePayable(invoice: Pick<OrderInvoice, "paymentStatus">): boolean {
  return ["PENDING", "REJECTED", "OVERDUE"].includes(invoice.paymentStatus);
}

/** Número que se muestra: el fiscal si Ofibites lo dio, si no el de la proforma. */
export function invoiceDisplayNumber(invoice: Pick<OrderInvoice, "fiscalNumber" | "invoiceNumber">): string {
  return invoice.fiscalNumber ?? invoice.invoiceNumber;
}

/** Nombre del archivo de "Descargar factura" (no depende de `Content-Disposition`, que puede no exponerse por CORS). */
export function invoiceFileName(invoice: Pick<OrderInvoice, "fiscalNumber" | "invoiceNumber">): string {
  return `factura-${invoiceDisplayNumber(invoice).replace(/[^\w.-]+/g, "-")}.pdf`;
}

/** "faltan 29 días", "vence hoy", "vence mañana", "hace 4 días" a partir de `daysUntilDue`. */
export function dueDistanceLabel(daysUntilDue: number): string {
  if (daysUntilDue === 0) return "vence hoy";
  if (daysUntilDue === 1) return "vence mañana";
  if (daysUntilDue > 1) return `faltan ${daysUntilDue} días`;
  const dias = Math.abs(daysUntilDue);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}

/** Máximo del comprobante (contrato: JPG, PNG o PDF hasta 5 MB). */
export const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const PAYMENT_PROOF_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
export const PAYMENT_PROOF_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"] as const;
export const PAYMENT_PROOF_ACCEPT = "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf";

/**
 * Problema de un comprobante antes de subirlo, con el mismo texto que el back; `null` si sirve. El MIME vacío (algunos
 * navegadores) lo decide la extensión; la firma real del archivo la comprueba el servidor.
 */
export function paymentProofProblem(file: File): string | null {
  const punto = file.name.lastIndexOf(".");
  const ext = punto === -1 ? "" : file.name.slice(punto + 1).toLowerCase();
  const mime = file.type.toLowerCase() === "image/jpg" ? "image/jpeg" : file.type.toLowerCase();
  const extOk = (PAYMENT_PROOF_EXTENSIONS as readonly string[]).includes(ext);
  const mimeOk = mime === "" || (PAYMENT_PROOF_MIME_TYPES as readonly string[]).includes(mime);
  if (!extOk || !mimeOk) return "El comprobante debe ser JPG, PNG o PDF";
  if (file.size > PAYMENT_PROOF_MAX_BYTES) return "El comprobante no puede pesar más de 5 MB";
  if (file.size === 0) return "El archivo está vacío. Elige otro comprobante";
  return null;
}
