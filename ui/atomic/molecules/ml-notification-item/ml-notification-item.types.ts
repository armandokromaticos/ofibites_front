import { ReactNode } from "react";

export interface MlNotificationItemProps {
  /** Texto del aviso, listo para mostrar. */
  message: string;
  /** Icono de lucide-react (decorativo), 14 px sobre `brand-soft`. */
  icon: ReactNode;
  /** Sin leer: mensaje en negrita, punto y "Sin leer" para lectores de pantalla. */
  isUnread?: boolean;
  /** "Hace 12 min". */
  dateLabel: string;
  /** ISO para `<time dateTime>`. */
  dateTime: string;
  /** Fecha completa ("4 de Sep, 10:30 am"), como `title` del `<time>`. */
  dateTitle?: string;
  /** Si se pasa, el aviso es un enlace (y `onPress` se llama además al pulsarlo). Sin `href` ni `onPress`, no es interactivo. */
  href?: string | null;
  onPress?: () => void;
  className?: string;
}
