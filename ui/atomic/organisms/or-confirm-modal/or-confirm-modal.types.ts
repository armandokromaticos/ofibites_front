export interface OrConfirmModalProps {
  isOpen: boolean;
  /** Cierra sin confirmar (Cancelar, Esc, clic fuera). */
  onClose: () => void;
  onConfirm: () => void;
  /** "¿Vaciar el carrito?". */
  title: string;
  description?: string;
  /** Texto del botón que confirma ("Vaciar carrito"). */
  confirmLabel: string;
  /** Por defecto "Cancelar". */
  cancelLabel?: string;
  /** Acción destructiva: el botón de confirmar va en `danger-700`. */
  isDestructive?: boolean;
  isConfirming?: boolean;
}
