import { useMutation } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { LoginRequest } from "@/domain/types";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      authService.login(data),
    onSuccess: (response) => {
      setAuth(
        response.user,
        response.accessToken,
        response.refreshToken
      );
    },
  });
}
