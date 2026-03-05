import { useQuery } from "@tanstack/react-query";

import { productService } from "@/domain/services";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
  });
}
