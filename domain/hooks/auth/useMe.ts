import { useQuery } from "@tanstack/react-query";

import { authService } from "@/domain/services";

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
