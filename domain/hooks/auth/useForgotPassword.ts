import { useMutation } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { ForgotPasswordRequest } from "@/domain/types";

/** `POST /auth/forgot-password`. Sirve para el primer envío y para "Reenviar enlace". */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
  });
}
