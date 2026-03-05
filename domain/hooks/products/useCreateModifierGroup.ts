import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";
import { CreateModifierGroupRequest } from "@/domain/types";

export function useCreateModifierGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateModifierGroupRequest;
    }) => productService.createModifierGroup(productId, data),
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
