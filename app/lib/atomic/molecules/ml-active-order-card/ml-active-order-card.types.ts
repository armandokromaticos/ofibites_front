import { ReactNode } from "react";

export interface MlActiveOrderCardOrder {
  productName: string;
  /** "10 boxes". */
  quantityLabel: string;
  /** "Llega a las 10:30 am". */
  etaLabel: string;
  /** Texto del estado ("En camino"). */
  statusLabel: string;
  /** Icono del chip (decorativo). */
  statusIcon?: ReactNode;
  /** Avance de 0 a 100. */
  progress: number;
}

export interface MlActiveOrderCardProps {
  /** Pedido en curso. `null` pinta el estado vacío. */
  order: MlActiveOrderCardOrder | null;
  isLoading?: boolean;
  /** Título de la card. Por defecto "Pedido en curso". */
  title?: string;
  /** Nivel del título. Por defecto 2. */
  headingLevel?: 2 | 3;
  /** Texto sin pedido en curso. */
  emptyMessage?: string;
  className?: string;
}
