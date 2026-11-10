import { ReactNode } from "react";

import { OrderStatusGroup } from "@/domain/types";
import { AtStatusChipTone } from "@/ui/atomic/atoms";

/**
 * Acción extra del menú "···" de una fila (además de "Ver pedido", que la tabla pone siempre con `detailHref`).
 * La página decide cuáles van en cada fila ("Repetir pedido", "Pagar factura" y "Descargar factura").
 */
export interface OrOrderTableAction {
  /** Clave estable que recibe `onRowAction` ("repetir", "pagar-factura"...). */
  key: string;
  label: string;
  /** Si se pasa, la opción es un enlace y no llama a `onRowAction`. */
  href?: string;
  isDisabled?: boolean;
}

export interface OrOrderTableRow {
  id: string;
  /** Sin "#": la tabla lo antepone ("001244" u "OF-2026-0007"). */
  orderNumber: string;
  /** Fecha ya formateada ("26/09/2026"). */
  dateLabel: string;
  /** Valor ISO para `<time dateTime>`. */
  dateTime?: string;
  /** Nombre del departamento o "—" si no se pudo resolver. */
  departmentLabel: string;
  /** Nombre de quien creó el pedido (o un respaldo: ver DECISIONES T-28b, sin nombre real para otros usuarios). */
  userLabel: string;
  /** "—" hasta que el back tenga un campo de tipo de pedido (propuesto en CONTRATOS-API). */
  typeLabel: string;
  /** Monto ya formateado ("$ 420,38") o "—" si el rol no tiene acceso a precios. */
  amountLabel: string;
  statusGroup: OrderStatusGroup;
  statusLabel: string;
  /** Chip de la columna PAGO ("Pendiente", "Completado"); `null` sin factura ("—"). */
  payment: { label: string; tone: AtStatusChipTone } | null;
  detailHref: string;
  /** Acciones del menú "···" después de "Ver pedido", en el orden en que se pintan. */
  actions?: OrOrderTableAction[];
}

export interface OrOrderTableProps {
  rows: OrOrderTableRow[];
  isLoading?: boolean;
  /** Se elige una acción de `row.actions` sin `href`. */
  onRowAction?: (row: OrOrderTableRow, actionKey: string) => void;
  /** Id del pedido con una acción en curso: su botón "···" queda deshabilitado. */
  busyOrderId?: string | null;
  /** Contenido sin filas (bajo la cabecera, como en el Figma 3564:1218). Por defecto, un texto corto. */
  emptyContent?: ReactNode;
  className?: string;
}
