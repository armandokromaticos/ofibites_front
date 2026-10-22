import { CompanyAddressBlockingOrder } from "@/domain/types";

export interface OrDeleteAddressModalProps {
  isOpen: boolean;
  /** "¿Eliminar Sede {addressLabel}?" (Figma `3659:2271`). */
  addressLabel: string;
  /**
   * Pedidos en curso que bloquean el borrado (`GET .../addresses/:id/blocking-orders`, T-31a). `undefined`
   * mientras no se haya consultado todavía (p. ej. el modal recién se abrió); `[]` si no hay ninguno.
   */
  blockingOrders?: CompanyAddressBlockingOrder[];
  /** La consulta de pedidos bloqueantes está en curso: no se sabe aún si hay que avisar. */
  isCheckingBlockingOrders?: boolean;
  isDeleting?: boolean;
  /** Error del intento de borrado (p. ej. el 409 del back si el chequeo previo no detectó el bloqueo a tiempo). */
  deleteError?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}
