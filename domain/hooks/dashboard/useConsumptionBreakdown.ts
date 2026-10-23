import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/domain/services";
import { ConsumptionBreakdownDimension, ConsumptionBreakdownResponse } from "@/domain/types";

export const CONSUMPTION_BREAKDOWN_QUERY_KEY = ["consumption-breakdown"] as const;

/**
 * El back expone el desglose en 3 rutas separadas (ver `dashboard.service`), no una sola con `?dimension=`.
 * Este hook elige la ruta según `dimension` y le añade esa misma etiqueta a la respuesta para que
 * `OrConsumptionBreakdownTable` siga discriminando por tipo sin saber que son 3 llamadas distintas.
 */
async function fetchBreakdown(
  dimension: ConsumptionBreakdownDimension,
  month: string,
): Promise<ConsumptionBreakdownResponse> {
  if (dimension === "branch") {
    const { rows, totals } = await dashboardService.getBranchBreakdown(month);
    return { dimension, rows, totals };
  }
  if (dimension === "department") {
    const { rows, totals } = await dashboardService.getDepartmentBreakdown(month);
    return { dimension, rows, totals };
  }
  const { rows } = await dashboardService.getUserBreakdown(month);
  return { dimension, rows };
}

/** "Desglose del consumo" por sede, departamento o usuario del mes elegido, contra el contrato real (T-32a). */
export function useConsumptionBreakdown(dimension: ConsumptionBreakdownDimension, month: string) {
  return useQuery({
    queryKey: [...CONSUMPTION_BREAKDOWN_QUERY_KEY, dimension, month],
    queryFn: () => fetchBreakdown(dimension, month),
    placeholderData: keepPreviousData,
  });
}
