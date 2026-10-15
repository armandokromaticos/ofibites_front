import { ReactNode } from "react";

export type MlEmptyStateTone = "neutral" | "error";

export interface MlEmptyStateProps {
  title: string;
  description?: string;
  /** Icono de lucide-react (decorativo). */
  icon?: ReactNode;
  /** `error` usa tonos `danger` y `role="alert"` para anunciarse. Por defecto `neutral`. */
  tone?: MlEmptyStateTone;
  /** `md` para una página o sección; `sm` dentro de una card estrecha. Por defecto `md`. */
  size?: "sm" | "md";
  /** Nivel del título dentro de la página. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  /** Texto del botón. Sin `actionLabel` no se pinta. */
  actionLabel?: string;
  /** Si se pasa, el botón es un enlace. */
  actionHref?: string;
  onAction?: () => void;
  isActionLoading?: boolean;
  className?: string;
}
