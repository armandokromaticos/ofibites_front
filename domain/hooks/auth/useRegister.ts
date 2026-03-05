import { useMutation } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { RegisterRequest } from "@/domain/types";

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      authService.register(data),
  });
}
