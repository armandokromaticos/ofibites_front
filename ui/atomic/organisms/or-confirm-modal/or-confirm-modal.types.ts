import type { ReactNode } from "react";

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
  /**
   * `sm` (por defecto): confirmación corta, unos 384 px. `lg`: confirmación con contenido (Figma 3568:1767,
   * "Repetir pedido"): 560 px, radio 20, padding 28, separación 18 y botones de 45 px con texto de 14 px.
   */
  size?: "sm" | "lg";
  /** Contenido bajo la descripción (p. ej. la lista de productos que se van a cargar). */
  children?: ReactNode;
}
