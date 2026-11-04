import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { InvoiceResponse, Order, OrderInvoice, SubmitInvoicePaymentRequest } from "@/domain/types";

import { cartQueryKey } from "../cart/useCart";
import { orderQueryKey } from "../orders/useOrder";
import { ordersQueryKey } from "../orders/useOrders";

import { creditLineQueryKey } from "./useCreditLine";

/** Solo los campos de `OrderInvoice` (la respuesta trae además el historial y la facturación). */
function aFacturaDelPedido(invoice: InvoiceResponse): OrderInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    paymentStatus: invoice.paymentStatus,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    creditDays: invoice.creditDays,
    isCredit: invoice.isCredit,
    isOverdue: invoice.isOverdue,
    daysUntilDue: invoice.daysUntilDue,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    balance: invoice.balance,
    paidAt: invoice.paidAt,
    hasFiscalPdf: invoice.hasFiscalPdf,
    fiscalNumber: invoice.fiscalNumber,
    latestPayment: invoice.latestPayment,
  };
}

/**
 * Tras reportar o cancelar un pago: el pedido toma la factura de la respuesta al instante y se vuelven a pedir el
 * pedido, la lista, el carrito (`invoiceAlert`) y la línea de crédito.
 */
function useAlTerminarPago() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return (invoice: InvoiceResponse) => {
    queryClient.setQueryData<Order>(orderQueryKey(companyId, invoice.orderId), (order) =>
      order ? { ...order, invoice: aFacturaDelPedido(invoice) } : order,
    );
    void queryClient.invalidateQueries({ queryKey: orderQueryKey(companyId, invoice.orderId) });
    void queryClient.invalidateQueries({ queryKey: ordersQueryKey(companyId) });
    void queryClient.invalidateQueries({ queryKey: cartQueryKey(companyId) });
    void queryClient.invalidateQueries({ queryKey: creditLineQueryKey(companyId) });
  };
}

/**
 * Tras un error (p. ej. 409: la factura ya no admite pagos o el comprobante ya se revisó), lo que se ve puede estar
 * desfasado: se vuelven a pedir el pedido, la lista, el carrito y la línea de crédito.
 */
function useAlFallarPago() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);

  return (_error: unknown, { orderId }: { orderId: string }) => {
    void queryClient.invalidateQueries({ queryKey: orderQueryKey(companyId, orderId) });
    void queryClient.invalidateQueries({ queryKey: ordersQueryKey(companyId) });
    void queryClient.invalidateQueries({ queryKey: cartQueryKey(companyId) });
    void queryClient.invalidateQueries({ queryKey: creditLineQueryKey(companyId) });
  };
}

/** `orderId` solo sirve para volver a pedir el pedido si el envío falla. */
interface SubmitVariables {
  invoiceId: string;
  orderId: string;
  body: SubmitInvoicePaymentRequest;
}

/**
 * "Enviar comprobante" (`POST /invoices/:id/payments`). Con `replacesPaymentId` sustituye en la misma transacción al
 * que estaba en revisión. Los errores llegan como `ApiError` con el mensaje del back en español.
 */
export function useSubmitInvoicePayment() {
  const alTerminar = useAlTerminarPago();
  const alFallar = useAlFallarPago();
  return useMutation({
    mutationFn: ({ invoiceId, body }: SubmitVariables) => invoiceService.submitPayment(invoiceId, body),
    onSuccess: alTerminar,
    onError: alFallar,
  });
}

/** "Cancelar envío" de un comprobante en revisión (`DELETE /invoices/:id/payments/:paymentId`). */
export function useWithdrawInvoicePayment() {
  const alTerminar = useAlTerminarPago();
  const alFallar = useAlFallarPago();
  return useMutation({
    mutationFn: ({ invoiceId, paymentId }: { invoiceId: string; orderId: string; paymentId: string }) =>
      invoiceService.withdrawPayment(invoiceId, paymentId),
    onSuccess: alTerminar,
    onError: alFallar,
  });
}
