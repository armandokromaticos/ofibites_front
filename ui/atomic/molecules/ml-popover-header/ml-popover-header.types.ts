import { Ref } from "react";

export interface MlPopoverHeaderAction {
  label: string;
  onPress: () => void;
  /** Nombre accesible más largo que el texto visible ("Vaciar el carrito"). */
  "aria-label"?: string;
  isDisabled?: boolean;
}

export interface MlPopoverHeaderProps {
  /** "Tu pedido", "Notificaciones". Se pinta como `<h2>`. */
  title: string;
  /** Id del título: el `aria-labelledby` del panel. */
  titleId?: string;
  /** Enlace de texto a la derecha ("Vaciar", "Marcar como leídas"). Sin valor no se pinta. */
  action?: MlPopoverHeaderAction;
  /** Ref del botón de la acción, para devolverle el foco (p. ej. al cancelar una confirmación). */
  actionRef?: Ref<HTMLButtonElement>;
  className?: string;
}
