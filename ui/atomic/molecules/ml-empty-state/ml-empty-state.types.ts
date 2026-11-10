import { ReactNode } from "react";

export type MlEmptyStateTone = "neutral" | "error";

export interface MlEmptyStateProps {
  title: string;
  description?: string;
  /** Icono de lucide-react (decorativo). */
  icon?: ReactNode;
  /** Ilustración decorativa del Figma (p. ej. el tomate de "sin resultados"), sin círculo de fondo. Gana a `icon`. */
  illustrationSrc?: string;
  /** Color del título: `foreground` (por defecto) o `brand` (estados vacíos dentro de una tabla, Figma 3564:1218). */
  titleTone?: "foreground" | "brand";
  /** `solid` (por defecto) o `bordered` ("Botón Secundario" del Figma: borde `primary` de 1 px). */
  actionVariant?: "solid" | "bordered";
  /** `error` usa tonos `danger` y `role="alert"` para anunciarse. Por defecto `neutral`. */
  tone?: MlEmptyStateTone;
  /** `md` para una página o sección; `sm` dentro de una card estrecha. Por defecto `md`. */
  size?: "sm" | "md";
  /** Nivel del título dentro de la página. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  /** Texto del botón. Sin `actionLabel` no se pinta. */
  actionLabel?: string;
  /** Si se pasa, el botón es un enlace (y `onAction`, si llega, se llama además al pulsarlo: p. ej. cerrar un popover). */
  actionHref?: string;
  onAction?: () => void;
  isActionLoading?: boolean;
  className?: string;
}
