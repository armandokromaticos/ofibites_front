import { ReactNode } from "react";

/** Tono del estado (superconjunto de `PaymentTone`, `OrderStatusGroupTone` y `MemberStatusTone` de `domain/models`). */
export type AtStatusChipTone = "success" | "warning" | "danger" | "neutral" | "info" | "sand" | "olive" | "inactive";

export interface AtStatusChipProps {
  tone: AtStatusChipTone;
  children: ReactNode;
  /** Punto delante del texto ("• Validado", modal del comprobante). */
  hasDot?: boolean;
  /** Sobre fondo oscuro (vista ampliada): fondo claro opaco para que el texto siga en AA. */
  onDark?: boolean;
  className?: string;
}
