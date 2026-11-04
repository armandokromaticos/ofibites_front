import { CreditLineResponse, InvoiceResponse, SubmitInvoicePaymentRequest } from "@/domain/types";
import { authBlobFetcher, AuthBlobResponse, authFetcher } from "@/shared/utils/fetch";

/** `inline` para la vista ampliada (iframe o imagen); `attachment` para "Descargar". */
export type InvoiceFileDisposition = "inline" | "attachment";

const ruta = (invoiceId: string) => `/invoices/${encodeURIComponent(invoiceId)}`;

/**
 * Facturas y pagos del cliente (T-06, contrato "Facturas y pagos del cliente"). `authFetcher` manda `X-Company-Id`
 * (obligatorio para clientes); una factura de otra empresa responde 404. Los archivos privados (PDF y comprobantes)
 * se piden con `authBlobFetcher`, nunca con un enlace directo.
 */
export const invoiceService = {
  /** `GET /invoices/:id`: la factura con todo el historial de pagos. */
  get: (invoiceId: string): Promise<InvoiceResponse> => authFetcher<InvoiceResponse>(ruta(invoiceId)),

  /** `GET /invoices/credit-line`: línea de crédito de la empresa activa (`creditLine: null` si es de contado). */
  getCreditLine: (): Promise<CreditLineResponse> => authFetcher<CreditLineResponse>("/invoices/credit-line"),

  /** `GET /invoices/:id/pdf`: la fiscal si Ofibites la subió (`hasFiscalPdf`), si no la proforma generada. */
  getPdf: (invoiceId: string, disposition: InvoiceFileDisposition = "inline"): Promise<AuthBlobResponse> =>
    authBlobFetcher(`${ruta(invoiceId)}/pdf?disposition=${disposition}`),

  /** `GET /invoices/:id/payments/:paymentId/proof`: el comprobante (JPG, PNG o PDF). */
  getProof: (
    invoiceId: string,
    paymentId: string,
    disposition: InvoiceFileDisposition = "inline",
  ): Promise<AuthBlobResponse> =>
    authBlobFetcher(`${ruta(invoiceId)}/payments/${encodeURIComponent(paymentId)}/proof?disposition=${disposition}`),

  /**
   * `POST /invoices/:id/payments` (`multipart/form-data`, solo pagadores) → 201 con la factura actualizada. 400 de
   * validación o `PAYMENT_AMOUNT_EXCEEDS_BALANCE`; 409 `INVOICE_NOT_PAYABLE`, `PAYMENT_ALREADY_PENDING` o
   * `PAYMENT_NOT_PENDING` (con `replacesPaymentId`). Los mensajes vienen en español y se muestran tal cual.
   */
  submitPayment: (invoiceId: string, body: SubmitInvoicePaymentRequest): Promise<InvoiceResponse> => {
    const form = new FormData();
    form.append("paymentDate", body.paymentDate);
    form.append("method", body.method);
    if (body.bank) form.append("bank", body.bank);
    form.append("reference", body.reference);
    // Hasta 2 decimales, con punto: el back lo transforma desde el texto del multipart.
    form.append("amount", body.amount.toFixed(2));
    if (body.replacesPaymentId) form.append("replacesPaymentId", body.replacesPaymentId);
    form.append("file", body.file);
    // `authFetcher` no pone `Content-Type` con `FormData`: el navegador añade el boundary.
    return authFetcher<InvoiceResponse>(`${ruta(invoiceId)}/payments`, { method: "POST", body: form, timeout: 60_000 });
  },

  /** `DELETE /invoices/:id/payments/:paymentId` ("Cancelar envío"): el pago pasa a `WITHDRAWN`. 409 si ya no está en revisión. */
  withdrawPayment: (invoiceId: string, paymentId: string): Promise<InvoiceResponse> =>
    authFetcher<InvoiceResponse>(`${ruta(invoiceId)}/payments/${encodeURIComponent(paymentId)}`, { method: "DELETE" }),
};
