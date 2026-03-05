import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/domain/services";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["users", id],
        exact: true,
      });
    },
  });
}
