import { Order } from "@/domain/types";

/**
 * Criterio único (detalle y lista) para ofrecer "Repetir pedido": que el pedido tenga líneas. Si la respuesta no
 * trae `items`, se ofrece igual y el editor decide con la vista previa (sin líneas disponibles, no deja agregar).
 */
export function sePuedeRepetir(order: Pick<Order, "items">): boolean {
  return order.items === undefined || order.items.length > 0;
}
