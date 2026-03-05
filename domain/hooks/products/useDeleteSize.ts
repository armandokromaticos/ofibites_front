import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";

export function useDeleteSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      id,
    }: {
      productId: string;
      id: string;
    }) => productService.deleteSize(productId, id),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId, "sizes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
        exact: true,
      });
    },
  });
}
