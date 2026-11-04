import { useMutation, useQuery } from "@tanstack/react-query";

import { invoiceFileName } from "@/domain/models";
import { invoiceService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { OrderInvoice } from "@/domain/types";
import { downloadBlob } from "@/shared/utils";

/** Clave de un archivo privado (vista previa `inline`). */
export const invoiceFileQueryKey = (companyId: string | null, kind: "pdf" | "proof", id: string) =>
  ["invoice-file", companyId, kind, id] as const;

/**
 * PDF de la factura para la vista ampliada (`GET /invoices/:id/pdf?disposition=inline`). La proforma se genera al
 * vuelo y su sello de estado cambia ("POR PAGAR", "PAGADA"…): se vuelve a pedir al abrirla si pasó un minuto.
 */
export function useInvoicePdf(
  invoiceId: string | null | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: invoiceFileQueryKey(companyId, "pdf", invoiceId ?? ""),
    queryFn: () => invoiceService.getPdf(invoiceId as string, "inline"),
    enabled: enabled && Boolean(companyId && invoiceId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}

/** Comprobante de un pago para la miniatura y la vista ampliada. Un comprobante no cambia: no se vuelve a pedir. */
export function usePaymentProof(
  invoiceId: string | null | undefined,
  paymentId: string | null | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: invoiceFileQueryKey(companyId, "proof", paymentId ?? ""),
    queryFn: () => invoiceService.getProof(invoiceId as string, paymentId as string, "inline"),
    enabled: enabled && Boolean(companyId && invoiceId && paymentId),
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    retry: false,
  });
}

/** "Descargar factura": pide el PDF como `attachment` y lo guarda con `factura-<número>.pdf`. */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (invoice: Pick<OrderInvoice, "id" | "fiscalNumber" | "invoiceNumber">) => {
      const { blob } = await invoiceService.getPdf(invoice.id, "attachment");
      downloadBlob(blob, invoiceFileName(invoice));
    },
  });
}

/** "Descargar" un comprobante con su nombre original (`proof.fileName`). */
export function useDownloadPaymentProof() {
  return useMutation({
    mutationFn: async ({
      invoiceId,
      paymentId,
      fileName,
    }: {
      invoiceId: string;
      paymentId: string;
      fileName: string;
    }) => {
      const { blob } = await invoiceService.getProof(invoiceId, paymentId, "attachment");
      downloadBlob(blob, fileName);
    },
  });
}
