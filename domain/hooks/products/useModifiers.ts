import { useQuery } from "@tanstack/react-query";

import { productService } from "@/domain/services";

export function useModifiers(productId: string, groupId: string) {
  return useQuery({
    queryKey: ["products", productId, "modifier-groups", groupId, "modifiers"],
    queryFn: () => productService.getModifiers(productId, groupId),
    enabled: !!productId && !!groupId,
  });
}
