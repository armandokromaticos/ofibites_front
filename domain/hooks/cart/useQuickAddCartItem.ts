import { useQueryClient } from "@tanstack/react-query";

import { catalogService } from "@/domain/services";
import { AddCartItemRequest, CatalogItemDetail, CatalogItemKind } from "@/domain/types";

import { catalogItemQueryKey } from "../catalog/useCatalogItem";

import { useAddCartItem } from "./useAddCartItem";

/** `anadido`: ya está en el carrito. `ficha`: hay que elegir en la ficha (varios tamaños u opciones obligatorias). */
export type QuickAddResult = "anadido" | "ficha";

/**
 * Cuerpo de `POST /cart/items` para añadir 1 unidad sin pasar por la ficha, o `null` si hace falta elegir: más de un
 * tamaño, modificadores obligatorios o un combo sin productos (el back pide un `productId` de ancla).
 */
function cuerpoDirecto(item: CatalogItemDetail): AddCartItemRequest | null {
  if (item.hasRequiredModifiers) return null;
  if (item.kind === "combo") {
    const ancla = item.comboItems[0];
    return ancla ? { productId: ancla.productId, comboId: item.id, quantity: 1 } : null;
  }
  if (item.servingOptions.length > 1) return null;
  const tamano = item.servingOptions[0];
  return { productId: item.id, quantity: 1, ...(tamano && { productSizeId: tamano.sizeId }) };
}

/**
 * "+" de "Agrega a tu pedido" (carrito): lee la ficha (`GET /catalog/items/:kind/:id`, compartida con la caché de
 * la ficha) y, si el ítem no exige elegir nada, añade 1 unidad con `useAddCartItem`. Si exige elegir, resuelve
 * `"ficha"` para que la página navegue. Los errores de red o del back se propagan (la promesa se rechaza).
 */
export function useQuickAddCartItem() {
  const queryClient = useQueryClient();
  const add = useAddCartItem();

  const quickAdd = async (kind: CatalogItemKind, id: string): Promise<QuickAddResult> => {
    const item = await queryClient.fetchQuery({
      queryKey: catalogItemQueryKey(kind, id),
      queryFn: () => catalogService.getItem(kind, id),
      staleTime: 60_000,
    });
    const body = cuerpoDirecto(item);
    if (!body) return "ficha";
    await add.mutateAsync(body);
    return "anadido";
  };

  return { quickAdd, isPending: add.isPending };
}
