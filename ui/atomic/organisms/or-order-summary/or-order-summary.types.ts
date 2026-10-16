import { ReactNode } from "react";

export interface OrOrderSummaryLine {
  id: string;
  name: string;
  imageSrc: string;
  /** "Cantidad: 2". */
  detail: string;
  /** Subtotal de la línea ya formateado por el caller ("$96"): lo calcula el servidor. */
  subtotalLabel: string;
  /** Aviso de la línea ("Ya no está disponible"), en `danger-700`. */
  notice?: string | null;
}

export interface OrOrderSummaryRow {
  label: string;
  /** Importe ya formateado ("$205,50", "Sin costo"). */
  value: string;
  /** Resalta el valor (p. ej. "Sin costo"), en `secondary-600` para que llegue a AA. */
  isHighlighted?: boolean;
}

export interface OrOrderSummaryProps {
  /** Por defecto "Resumen del pedido". */
  title?: string;
  /** Id del título (para `aria-labelledby` del `aside`). */
  titleId: string;
  /** "3 productos · 4 unidades". */
  countLabel?: string;
  /** Línea bajo el título en `brand` (p. ej. "Sede: Av. El Bosque · Caracas", Figma 3339:13048). */
  subtitle?: string;
  /** Bloque entre el título y las líneas (p. ej. la entrega con "Editar"). */
  header?: ReactNode;
  /** Sin líneas no se pinta la lista. */
  lines?: OrOrderSummaryLine[];
  /** Subtotal, envío, IVA... en orden. */
  rows: OrOrderSummaryRow[];
  /** Total ya formateado ("$238,38"). */
  totalLabel: string;
  /** Acciones y avisos al pie (botón principal, "Volver", nota). */
  children?: ReactNode;
  className?: string;
}
