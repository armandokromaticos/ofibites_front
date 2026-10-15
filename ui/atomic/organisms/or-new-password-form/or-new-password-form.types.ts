import { ReactNode } from "react";

export interface OrNewPasswordFormProps {
  /** Se llama solo con una contraseña que cumple todas las reglas y coincide con la confirmación. */
  onSubmit: (password: string) => void;
  isSubmitting?: boolean;
  /** Error del servidor (p. ej. "La nueva contraseña debe ser distinta de la anterior."), en una alerta. */
  error?: string | null;
  /** Se llama al editar cualquiera de los dos campos (para limpiar el error del servidor). */
  onEdit?: () => void;
  submitLabel?: string;
  /** Debajo del botón (en el Figma, "Volver al inicio de sesión"). */
  footer?: ReactNode;
  className?: string;
}
