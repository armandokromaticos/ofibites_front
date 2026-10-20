import { Order } from "@/domain/types";

/** Estados de QA de "Pedidos realizados" que se fuerzan con `?estado=` (solo en desarrollo). */
export type EstadoQaPedidos = "cargando" | "vacio" | "error";

const ESTADOS_QA: readonly EstadoQaPedidos[] = ["cargando", "vacio", "error"];

export function parseEstadoQaPedidos(value: unknown): EstadoQaPedidos | undefined {
  return ESTADOS_QA.find((estado) => estado === value);
}

// Mismo patrón que el Dashboard (`domain/hooks/dashboard/estado-qa.ts`): con `?estado=error` fallan los dos
// primeros intentos (el automático y el reintento de React Query) y luego "Reintentar" carga.
let intentosConError = 0;

/** `queryFn` de "Pedidos realizados" con el estado de QA aplicado sobre la respuesta real. */
export function conEstadoQaPedidos(
  estado: EstadoQaPedidos | undefined,
  pedir: () => Promise<Order[]>,
): () => Promise<Order[]> {
  return async () => {
    if (estado === "cargando") return new Promise<never>(() => {});
    if (estado !== "error") {
      intentosConError = 0;
    } else if (intentosConError < 2) {
      intentosConError += 1;
      throw new Error("Error simulado de Pedidos realizados (?estado=error)");
    }

    const orders = await pedir();
    return estado === "vacio" ? [] : orders;
  };
}
