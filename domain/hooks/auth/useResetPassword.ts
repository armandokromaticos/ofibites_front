import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { ResetPasswordRequest } from "@/domain/types";

/**
 * `POST /auth/reset-password`. El back cierra todas las sesiones del usuario al cambiar la
 * contraseña: si este navegador guardaba una sesión, se descarta también aquí. Si no, "Iniciar
 * sesión" llevaría a `/login`, que redirige al dashboard con un token ya revocado.
 */
export function useResetPassword() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      logout();
      queryClient.removeQueries();
    },
  });
}
