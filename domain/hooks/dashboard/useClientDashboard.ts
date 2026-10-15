import { useQuery } from "@tanstack/react-query";

// TODO: conectar API (T-04). Datos de ejemplo junto al hook (decisión del usuario, movidos aquí en T-20):
// al conectar, se sustituye por el servicio y `datos-ejemplo.ts` se borra.
import { crearQueryFnDeEjemplo, EstadoQaDashboard } from "./datos-ejemplo";

export const CLIENT_DASHBOARD_QUERY_KEY = ["client-dashboard"] as const;

interface UseClientDashboardOptions {
  /** Fuerza un estado de QA (solo desarrollo, lo filtra `app/(cliente)/dashboard/page.tsx`). */
  qaState?: EstadoQaDashboard;
}

export function useClientDashboard({ qaState }: UseClientDashboardOptions = {}) {
  return useQuery({
    queryKey: [...CLIENT_DASHBOARD_QUERY_KEY, qaState ?? "real"],
    // TODO: conectar API (T-04). Única línea a cambiar: `queryFn: () => dashboardService.getClientDashboard()`.
    queryFn: crearQueryFnDeEjemplo(qaState),
    // En QA no se reutiliza un éxito cacheado: cada visita a `?estado=` vuelve a simular el estado.
    ...(qaState && { gcTime: 0, staleTime: 0 }),
  });
}
