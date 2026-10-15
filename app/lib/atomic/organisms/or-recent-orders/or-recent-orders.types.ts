import { MlOrderRowProps } from "@/app/lib/atomic/molecules";

export type OrRecentOrdersItem = Omit<MlOrderRowProps, "onRepeat" | "isRepeatLoading" | "onDetail" | "className"> & {
  id: string;
};

export interface OrRecentOrdersProps {
  orders: OrRecentOrdersItem[];
  isLoading?: boolean;
  /** Título de la card. Por defecto "Últimas órdenes". */
  title?: string;
  /** Nivel del título. Por defecto 2. */
  headingLevel?: 2 | 3;
  /** Enlace "Ver todas". Sin valor, o sin órdenes, no se pinta. */
  viewAllHref?: string;
  /** Repetir un pedido (o `repeatHref` en cada fila). Sin ninguno de los dos, "Repetir" sale no disponible (`aria-disabled`) en todas las filas. */
  onRepeat?: (orderId: string) => void;
  /** id del pedido que se está repitiendo (spinner en su botón). */
  repeatingOrderId?: string;
  /** Filas del esqueleto de carga. Por defecto 3. */
  skeletonRows?: number;
  /** Estado vacío: copy y CTA. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  className?: string;
}
