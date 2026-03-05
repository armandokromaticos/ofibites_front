import { useQuery } from "@tanstack/react-query";

import { userService } from "@/domain/services";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });
}
