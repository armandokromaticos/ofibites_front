import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";
import { CreateModifierRequest } from "@/domain/types";

export function useCreateModifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      groupId,
      data,
    }: {
      productId: string;
      groupId: string;
      data: CreateModifierRequest;
    }) => productService.createModifier(productId, groupId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "products",
          variables.productId,
          "modifier-groups",
          variables.groupId,
          "modifiers",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId, "modifier-groups"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
    },
  });
}
