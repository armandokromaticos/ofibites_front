import { useQuery } from "@tanstack/react-query";

import { productService } from "@/domain/services";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}
