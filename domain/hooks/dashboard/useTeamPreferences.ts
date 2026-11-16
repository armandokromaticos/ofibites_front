import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { TeamPreferencesResponse } from "@/domain/types";

export const TEAM_PREFERENCES_QUERY_KEY = ["team-preferences"] as const;

interface UseTeamPreferencesOptions {
  /**
   * Solo desarrollo (`?preferencias=` del Dashboard): simula una respuesta con estos slugs de sección sin llamar
   * al back. Lista vacía = `source: "none"`.
   */
  qaSectionSlugs?: string[];
}

function respuestaQa(sectionSlugs: string[]): TeamPreferencesResponse {
  return {
    source: sectionSlugs.length > 0 ? "registration" : "none",
    solutions: [],
    sectionSlugs,
    peoplePerOrder: null,
    orderFrequency: null,
  };
}

/**
 * Preferencias del equipo de la empresa activa (`GET /dashboard/client/preferences`, T-45). Opcional para la
 * pantalla: mientras carga o si falla, el Dashboard se pinta como sin preferencias (nunca lo bloquea).
 */
export function useTeamPreferences({ qaSectionSlugs }: UseTeamPreferencesOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [...TEAM_PREFERENCES_QUERY_KEY, companyId, qaSectionSlugs?.join(",") ?? "real"],
    queryFn: () =>
      qaSectionSlugs
        ? Promise.resolve(respuestaQa(qaSectionSlugs))
        : dashboardService.getTeamPreferences(),
    // Sin empresa activa no hay a quién preguntar (el back respondería 400).
    enabled: Boolean(companyId) || qaSectionSlugs !== undefined,
    // Cambian solo al aprobar la solicitud: no hace falta volver a pedirlas en la sesión.
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}
