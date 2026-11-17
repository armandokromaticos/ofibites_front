import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { EscenarioQaRepetir, esperaQa, vistaPreviaQa } from "@/domain/hooks/orders/pedido-qa";
import { cartService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { RepeatOrderItemInput } from "@/domain/types";

/** Clave de la vista previa de repetir: `items` en `null` = todas las líneas con su cantidad original. */
export const repeatPreviewQueryKey = (
  companyId: string | null,
  orderId: string,
  items: RepeatOrderItemInput[] | null,
) => ["repeat-preview", companyId, orderId, items] as const;

// Con `?qa=error` fallan los dos primeros intentos (el automático y el reintento) y luego "Reintentar" carga.
let intentosConError = 0;

interface UseRepeatPreviewOptions {
  /** `false` mientras no haga falta (p. ej. sin líneas elegidas, que el back rechaza con 400). */
  enabled?: boolean;
  /** Datos de ejemplo (solo desarrollo). */
  qa?: EscenarioQaRepetir;
}

/**
 * Vista previa del editor "Repetir pedido" (`POST /cart/repeat/:orderId/preview`, T-38): precios de hoy,
 * disponibilidad y resumen calculados por el servidor; no toca el carrito. Mientras llega una nueva, conserva la
 * anterior (`keepPreviousData`) para que el resumen no parpadee al editar cantidades.
 */
export function useRepeatPreview(
  orderId: string,
  items: RepeatOrderItemInput[] | null,
  { enabled = true, qa }: UseRepeatPreviewOptions = {},
) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const body = items ? { items } : undefined;
  return useQuery({
    queryKey: [...repeatPreviewQueryKey(companyId, orderId, items), qa ?? "real"],
    queryFn: async () => {
      if (!qa) return cartService.previewRepeat(orderId, body);
      if (qa === "cargando") return new Promise<never>(() => {});
      if (qa === "error" && intentosConError < 2) {
        intentosConError += 1;
        throw new Error("Error simulado de la vista previa (?qa=error)");
      }
      return esperaQa(vistaPreviaQa(qa === "error" ? "normal" : qa, orderId, body));
    },
    enabled: Boolean(companyId && orderId) && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: (failureCount, error) => !(error && typeof error === "object" && "statusCode" in error) && failureCount < 1,
  });
}
