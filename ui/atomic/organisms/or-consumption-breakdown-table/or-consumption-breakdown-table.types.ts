import { ConsumptionBreakdownDimension, ConsumptionBreakdownResponse } from "@/domain/types";

export interface OrConsumptionBreakdownTableProps {
  dimension: ConsumptionBreakdownDimension;
  onDimensionChange: (dimension: ConsumptionBreakdownDimension) => void;
  /** Solo `COMPANY_ADMIN`/`COMPANY_FINANCE` ven la pestaña "Usuario" (reforzado también en el back). */
  canViewUserBreakdown: boolean;
  data: ConsumptionBreakdownResponse;
  /** "agosto": nombre del mes anterior al seleccionado, para la cabecera "vs. agosto". */
  previousMonthLabel: string;
  /** Hay una consulta en vuelo (cambio de mes o de pestaña): atenúa la tabla sin ocultarla. */
  isFetching?: boolean;
  className?: string;
}
