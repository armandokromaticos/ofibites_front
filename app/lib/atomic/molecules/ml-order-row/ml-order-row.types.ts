import { ReactNode } from "react";

export interface MlOrderRowProps {
  /** "Morning bites". */
  productName: string;
  /** "8 boxes". */
  quantityLabel: string;
  /** Texto del estado ("Entregado"). El chip nunca depende solo del color. */
  statusLabel: string;
  /** Icono opcional del chip (decorativo). */
  statusIcon?: ReactNode;
  address: string;
  /** Número del pedido sin "#" ("56779"): el componente lo antepone. */
  orderNumber: string;
  /** Fecha ya formateada ("4 de Sep"). */
  dateLabel: string;
  /** Valor ISO para `<time dateTime>`. */
  dateTime?: string;
  /** Repite el pedido. Sin `onRepeat`, el botón sale con `aria-disabled` (enfocable, inerte) y "Disponible próximamente" como descripción. */
  onRepeat?: () => void;
  isRepeatLoading?: boolean;
  /** Si se pasa, "Ver detalle" es un enlace. */
  detailHref?: string;
  onDetail?: () => void;
  className?: string;
}
