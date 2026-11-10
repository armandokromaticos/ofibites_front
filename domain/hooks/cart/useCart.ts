import { useQuery } from "@tanstack/react-query";

import { cartService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

/**
 * Clave del carrito del usuario en la empresa activa. Lleva el `companyId`: cada usuario tiene un carrito por empresa
 * (el back lo resuelve con el token y `X-Company-Id`).
 */
export const cartQueryKey = (companyId: string | null) => ["cart", companyId] as const;

interface UseCartOptions {
  /**
   * `false`: no pide `GET /cart` y solo muestra lo que ya hay en caché (p. ej. la respuesta de
   * `POST /cart/items`). Por defecto `true`.
   */
  enabled?: boolean;
  /**
   * `true`: vuelve a pedir el carrito al montar aunque la caché sea reciente. El checkout cotiza con el estado
   * actual del servidor: el carrito es del usuario, pero puede haberlo cambiado en otra pestaña o dispositivo, y
   * los precios y la disponibilidad se recalculan en el servidor. Por defecto `false`.
   */
  fresh?: boolean;
}

/** Carrito del usuario en la empresa activa (`GET /cart`, con `X-Company-Id`). */
export function useCart({ enabled = true, fresh = false }: UseCartOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: cartQueryKey(companyId),
    queryFn: () => cartService.get(),
    enabled: enabled && Boolean(companyId),
    // El contador no necesita estar al segundo; "Añadir al carrito" lo actualiza con su respuesta.
    staleTime: 30_000,
    refetchOnMount: fresh ? "always" : true,
    // Un 403 (rol sin carrito) o un 400 no mejoran al reintentar: el contador simplemente no se muestra.
    retry: false,
  });
}
