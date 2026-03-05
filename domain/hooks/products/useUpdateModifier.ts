import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/domain/services";
import { UpdateModifierRequest } from "@/domain/types";

export function useUpdateModifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      groupId,
      id,
      data,
    }: {
      productId: string;
      groupId: string;
      id: string;
      data: UpdateModifierRequest;
    }) => productService.updateModifier(productId, groupId, id, data),
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
