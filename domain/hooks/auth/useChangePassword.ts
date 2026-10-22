import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { ChangePasswordRequest } from "@/domain/types";

import { ME_QUERY_KEY } from "./useMe";

/**
 * `POST /auth/change-password` (Mi perfil, T-30). El back cierra las demás sesiones y mantiene esta: no hay que
 * volver a iniciar sesión. Tras el 204 se refresca `useMe` para "Última vez que la cambiaste".
 * La contraseña actual incorrecta llega como 400 (no 401): `authFetcher` no intenta refrescar ni cierra la sesión.
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
  });
}
