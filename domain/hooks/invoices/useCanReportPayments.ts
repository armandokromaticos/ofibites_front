import { canReportPayments } from "@/domain/models";
import { useAuthStore } from "@/domain/stores";

/**
 * Si el usuario puede reportar pagos en la empresa activa (`COMPANY_ADMIN` o `canPayInvoices`, contrato T-06 punto 3).
 * Sin permiso se ocultan "Pagar factura", "Subir comprobante" y "Cancelar envío" (el servidor responde 403 igual).
 */
export function useCanReportPayments(): boolean {
  return useAuthStore((state) =>
    canReportPayments(
      state.memberships.find((membership) => membership.companyId === state.activeCompanyId),
    ),
  );
}
