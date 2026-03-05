import { useQuery } from "@tanstack/react-query";

import { productService } from "@/domain/services";

export function useProductSizes(productId: string) {
  return useQuery({
    queryKey: ["products", productId, "sizes"],
    queryFn: () => productService.getSizes(productId),
    enabled: !!productId,
  });
}
