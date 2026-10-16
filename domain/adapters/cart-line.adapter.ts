import { CartLineModel } from "@/domain/models";
import { CartItem } from "@/domain/types";

function servingsLabel(item: CartItem): string | null {
  if (item.servings) return `${item.servings} ${item.servings === 1 ? "persona" : "personas"}`;
  return item.sizeLabel || null;
}

/** Línea de `GET /cart` (ya trae nombre, imagen, tamaño y disponibilidad) → modelo de UI. */
export function toCartLineModel(item: CartItem): CartLineModel {
  return {
    id: item.id,
    kind: item.comboId ? "combo" : "product",
    catalogId: item.comboId ?? item.productId,
    name: item.name,
    imageSrc: item.image,
    quantity: item.quantity,
    servingsLabel: servingsLabel(item),
    unitPrice: item.unitPrice,
    hasModifiers: item.modifiers.length > 0,
    isAvailable: item.isAvailable,
    subtotal: item.subtotal,
  };
}
