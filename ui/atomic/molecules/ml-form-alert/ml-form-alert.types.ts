import { ReactNode } from "react";

export interface MlFormAlertProps {
  /** Frase inicial destacada (en el Figma, "Correo o contraseña incorrectos."). */
  title?: string;
  /** Detalle tras el título. */
  children?: ReactNode;
  id?: string;
  className?: string;
}
