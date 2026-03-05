import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";
import { UpdateModifierGroupRequest } from "@/domain/types";

export function useUpdateModifierGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      id,
      data,
    }: {
      productId: string;
      id: string;
      data: UpdateModifierGroupRequest;
    }) => productService.updateModifierGroup(productId, id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId, "modifier-groups"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
    },
  });
}
