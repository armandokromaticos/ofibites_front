import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";
import { UpdateSizeRequest } from "@/domain/types";

export function useUpdateSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      id,
      data,
    }: {
      productId: string;
      id: string;
      data: UpdateSizeRequest;
    }) => productService.updateSize(productId, id, data),
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
