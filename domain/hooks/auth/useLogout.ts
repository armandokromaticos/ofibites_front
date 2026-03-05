import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
