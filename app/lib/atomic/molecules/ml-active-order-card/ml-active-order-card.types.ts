import { ReactNode } from "react";

export interface MlActiveOrderCardStep {
  label: string;
  /** Paso ya alcanzado (el actual incluido). */
  isDone: boolean;
}

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
  /** En camino: el icono del chip se mece (bucle suave, solo mientras la card se ve). */
  isInTransit?: boolean;
  /**
   * Pasos del pedido (Confirmado → … → Entregado). Se despliegan bajo la barra al pasar o enfocar la card;
   * los lectores de pantalla los leen siempre.
   */
  steps?: MlActiveOrderCardStep[];
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
