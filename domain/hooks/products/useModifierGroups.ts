import { useQuery } from "@tanstack/react-query";

import { productService } from "@/domain/services";

export function useModifierGroups(productId: string) {
  return useQuery({
    queryKey: ["products", productId, "modifier-groups"],
    queryFn: () => productService.getModifierGroups(productId),
    enabled: !!productId,
  });
}
