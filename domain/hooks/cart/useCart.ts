import { useQuery } from "@tanstack/react-query";

import { cartService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

/** Clave del carrito de la empresa activa (lleva el `companyId`: cada empresa tiene su carrito). */
export const cartQueryKey = (companyId: string | null) => ["cart", companyId] as const;

interface UseCartOptions {
  /**
   * `false`: no pide `GET /cart` y solo muestra lo que ya hay en caché (p. ej. la respuesta de
   * `POST /cart/items`). Por defecto `true`.
   */
  enabled?: boolean;
}

/** Carrito de la empresa activa (`GET /cart`, con `X-Company-Id`). */
export function useCart({ enabled = true }: UseCartOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: cartQueryKey(companyId),
    queryFn: () => cartService.get(),
    enabled: enabled && Boolean(companyId),
    // El contador no necesita estar al segundo; "Añadir al carrito" lo actualiza con su respuesta.
    staleTime: 30_000,
    // Un 403 (rol sin carrito) o un 400 no mejoran al reintentar: el contador simplemente no se muestra.
    retry: false,
  });
}
