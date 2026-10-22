export type OrStatusModalTone = "success" | "error";

export interface OrStatusModalAction {
  label: string;
  onPress: () => void;
}

export interface OrStatusModalProps {
  isOpen: boolean;
  /** Cierre con Esc o clic fuera (y, si no hay `primaryAction`, con "Entendido"). */
  onClose: () => void;
  /** `success`: check sobre `brand-soft`. `error`: "!" sobre tinte `accent` y `role="alertdialog"`. */
  tone: OrStatusModalTone;
  /** "Perfil actualizado". */
  title: string;
  description?: string;
  /** Nota pequeña bajo la descripción (texto `subtle`) o, en `error`, en una caja crema. */
  note?: string;
  /** Botón principal. Por defecto "Entendido", que cierra. */
  primaryAction?: OrStatusModalAction;
  /**
   * Al terminar la animación de salida. Para mover el foco a otro sitio hay que esperar a esto: mientras el modal
   * está montado, su `FocusScope` retiene el foco y al desmontar lo devuelve al botón que lo abrió.
   */
  onExited?: () => void;
  /** Botón secundario (bordeado), a la izquierda del principal ("Olvidé mi contraseña"). */
  secondaryAction?: OrStatusModalAction;
}
