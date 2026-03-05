import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";
import { CreateSizeRequest } from "@/domain/types";

export function useCreateSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateSizeRequest;
    }) => productService.createSize(productId, data),
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
