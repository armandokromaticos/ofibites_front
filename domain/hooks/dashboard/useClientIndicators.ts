import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/domain/services";

export const CLIENT_INDICATORS_QUERY_KEY = ["client-indicators"] as const;

/** Indicadores de "Mi perfil" del mes elegido ("AAAA-MM"), contra el contrato real (T-32a, IMPLEMENTADO). */
export function useClientIndicators(month: string) {
  return useQuery({
    queryKey: [...CLIENT_INDICATORS_QUERY_KEY, month],
    queryFn: () => dashboardService.getClientIndicators(month),
  });
}
