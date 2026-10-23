import { useMutation } from "@tanstack/react-query";

import { dashboardService } from "@/domain/services";
import { ConsumptionBreakdownDimension } from "@/domain/types";

interface ExportConsumptionVariables {
  dimension: ConsumptionBreakdownDimension;
  month: string;
}

/**
 * Botón "Exportar" de Indicadores: `GET /dashboard/client/export?view=&month=` (contrato real, T-32a). El
 * CSV lo arma y nombra el servidor (`Content-Disposition`); el front solo dispara la descarga del `blob`.
 */
export function useExportConsumption() {
  return useMutation({
    mutationFn: ({ dimension, month }: ExportConsumptionVariables): Promise<void> =>
      dashboardService.exportConsumption(dimension, month),
  });
}
