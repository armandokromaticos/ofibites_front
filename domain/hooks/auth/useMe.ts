import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { MeResponse } from "@/domain/types";

export const ME_QUERY_KEY = ["auth", "me"] as const;

/** `GET /auth/me`: perfil y empresas del usuario. Solo con sesión (`enabled`). */
export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => authService.getMe(),
    enabled,
    // Un 401 ya pasó por el refresh de `authFetcher`: reintentar no arregla nada.
    retry: false,
  });
}

/**
 * Lo mismo que `useUpdateMe` tras guardar: la respuesta tiene la forma de `GET /auth/me`, así que reemplaza la caché
 * de `useMe` sin otro GET y actualiza la sesión (avatar del sidebar, de la top bar y del menú de cuenta).
 */
export function useSincronizarMe() {
  const queryClient = useQueryClient();
  const syncMe = useAuthStore((state) => state.syncMe);
  return (me: MeResponse) => {
    queryClient.setQueryData(ME_QUERY_KEY, me);
    syncMe(me);
    // La administración de usuarios lee los datos del miembro: que no se quede con los anteriores.
    void queryClient.invalidateQueries({ queryKey: ["company-members"] });
  };
}
