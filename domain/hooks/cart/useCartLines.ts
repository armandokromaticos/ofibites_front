import { useMemo } from "react";

import { toCartLineModel } from "@/domain/adapters";
import { CartLineModel } from "@/domain/models";
import { CartResponse } from "@/domain/types";

/** Líneas del carrito listas para pintar (`GET /cart` ya trae nombre, imagen, tamaño y disponibilidad). */
export function useCartLines(cart: CartResponse | undefined): CartLineModel[] {
  return useMemo(() => (cart?.items ?? []).map(toCartLineModel), [cart]);
}
