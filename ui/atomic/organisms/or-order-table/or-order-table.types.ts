import { OrderStatusGroup } from "@/domain/types";

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
  detailHref: string;
}

export interface OrOrderTableProps {
  rows: OrOrderTableRow[];
  isLoading?: boolean;
  className?: string;
}
