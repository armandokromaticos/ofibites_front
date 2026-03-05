import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/domain/services";
import { CreateUserRequest } from "@/domain/types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
