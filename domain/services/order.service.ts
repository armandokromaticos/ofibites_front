import { Order } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

export const orderService = {
  /**
   * Órdenes visibles para el usuario. `authFetcher` envía `X-Company-Id` (la empresa activa), que las restringe
   * a esa empresa. Sin paginar: el back devuelve todas.
   */
  list: (): Promise<Order[]> => authFetcher<Order[]>("/orders"),
};
