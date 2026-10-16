import { ClientDashboard } from "@/domain/models";

/** Estados de QA del Dashboard que se fuerzan con `?estado=` (solo en desarrollo). */
export type EstadoQaDashboard = "cargando" | "vacio" | "error";

const ESTADOS_QA: readonly EstadoQaDashboard[] = ["cargando", "vacio", "error"];

export function parseEstadoQa(value: unknown): EstadoQaDashboard | undefined {
  return ESTADOS_QA.find((estado) => estado === value);
}

// Con `?estado=error` fallan los dos primeros intentos (el automático y el reintento de React Query): el botón
// "Reintentar" de la pantalla de error ya carga. Fuera de ese estado se reinicia, para que volver a él vuelva a fallar.
let intentosConError = 0;

/** `queryFn` del Dashboard con el estado de QA aplicado sobre la respuesta real. `vacio`: sin pedidos. */
export function conEstadoQaDashboard(
  estado: EstadoQaDashboard | undefined,
  pedir: () => Promise<ClientDashboard>,
): () => Promise<ClientDashboard> {
  return async () => {
    if (estado === "cargando") return new Promise<never>(() => {});
    if (estado !== "error") {
      intentosConError = 0;
    } else if (intentosConError < 2) {
      intentosConError += 1;
      throw new Error("Error simulado del Dashboard (?estado=error)");
    }

    const dashboard = await pedir();
    if (estado !== "vacio") return dashboard;
    return { ...dashboard, activeOrder: null, recentOrders: [] };
  };
}
