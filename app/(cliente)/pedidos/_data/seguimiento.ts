import { ORDER_STATUS_GROUP_LABELS, ORDER_STATUS_GROUP_STEPS, orderStatusGroupStepIndex } from "@/domain/models";
import { Order, OrderStatusHistoryEntry, OrderStatusValue } from "@/domain/types";

import { diaMes, diaMesPura, fechaPura, hora, horaPared } from "./textos-pago";

// Seguimiento del detalle del pedido desde `statusHistory` (T-38; reglas en CONTRATOS-API "Revisión front (T-38b)" y
// DECISIONES 2026-11-17 "T-38b"): tres pasos (Recibido / Programado / Entregado) e `IN_TRANSIT` como ayuda del paso
// Programado. Por estado vale la **última** entrada. Un paso superado sin entrada (pedidos anteriores al historial) va
// hecho y sin texto; una entrada `estimated` (fecha reconstruida en el backfill) muestra solo el día, sin hora.

type Seguimiento = Pick<Order, "statusGroup" | "deliveryDate" | "deliveryTime" | "statusHistory">;

/** Última entrada del historial con ese estado. */
export function ultimaEntrada(
  historial: OrderStatusHistoryEntry[] | undefined,
  status: OrderStatusValue,
): OrderStatusHistoryEntry | undefined {
  if (!historial) return undefined;
  for (let index = historial.length - 1; index >= 0; index -= 1) {
    if (historial[index].status === status) return historial[index];
  }
  return undefined;
}

/** "24/09, 9:15 a. m." en hora de Caracas, o solo "24/09" si la fecha es estimada. */
export function cuandoEntrada(entrada: OrderStatusHistoryEntry): string {
  return entrada.estimated ? diaMes(entrada.at) : `${diaMes(entrada.at)}, ${hora(entrada.at)}`;
}

/** Pasos cumplidos: el del grupo actual va "en curso"; Entregado deja los tres cumplidos. */
export function pasosCumplidos(order: Pick<Order, "statusGroup">): number {
  return order.statusGroup === "delivered"
    ? ORDER_STATUS_GROUP_STEPS.length
    : orderStatusGroupStepIndex(order.statusGroup);
}

function paraCuando(order: Seguimiento): string | undefined {
  if (fechaPura(order.deliveryDate) === "—") return undefined;
  const horaEntrega = horaPared(order.deliveryTime);
  return `Para el ${diaMesPura(order.deliveryDate)}${horaEntrega ? ` a las ${horaEntrega}` : ""}`;
}

/** Texto bajo cada paso ("Confirmado el 24/09, 9:15 a. m.", "Para el 30/09 a las 8:30 a. m.", "Pendiente"). */
export function ayudasSeguimiento(order: Seguimiento): (string | undefined)[] {
  const historial = order.statusHistory;
  const cumplidos = pasosCumplidos(order);
  return ORDER_STATUS_GROUP_STEPS.map((paso, index) => {
    if (index > cumplidos) return "Pendiente";
    const enCurso = index === cumplidos;
    if (paso === "received") {
      const confirmado = ultimaEntrada(historial, "CONFIRMED");
      if (confirmado) return `Confirmado el ${cuandoEntrada(confirmado)}`;
      const creado = ultimaEntrada(historial, "CREATED");
      return creado ? `Recibido el ${cuandoEntrada(creado)}` : undefined;
    }
    if (paso === "scheduled") {
      if (enCurso && order.statusGroup === "in_transit") {
        const enCamino = ultimaEntrada(historial, "IN_TRANSIT");
        return enCamino && !enCamino.estimated ? `En camino desde las ${hora(enCamino.at)}` : "En camino";
      }
      const preparado = ultimaEntrada(historial, "IN_PREPARATION");
      if (preparado) return `Preparado el ${cuandoEntrada(preparado)}`;
      return enCurso ? paraCuando(order) : undefined;
    }
    const entregado = ultimaEntrada(historial, "DELIVERED");
    if (entregado) return `Entregado el ${cuandoEntrada(entregado)}`;
    return enCurso ? "Pendiente" : undefined;
  });
}

/** Chip de "Estado del pedido": "Entregado el 26/09, 12:24 p. m.", "Programado para el 30/09" o la etiqueta del grupo. */
export function textoEstadoPedido(order: Seguimiento): string {
  if (order.statusGroup === "delivered") {
    const entregado = ultimaEntrada(order.statusHistory, "DELIVERED");
    return entregado ? `Entregado el ${cuandoEntrada(entregado)}` : ORDER_STATUS_GROUP_LABELS.delivered;
  }
  if (order.statusGroup === "scheduled" || order.statusGroup === "in_transit") {
    return fechaPura(order.deliveryDate) !== "—"
      ? `Programado para el ${diaMesPura(order.deliveryDate)}`
      : ORDER_STATUS_GROUP_LABELS[order.statusGroup];
  }
  return ORDER_STATUS_GROUP_LABELS[order.statusGroup];
}

/** Cuándo se canceló o rechazó (" el 24/09, 11:02 a. m."), o "" si no hay entrada. */
export function cuandoCancelado(order: Seguimiento): string {
  const entrada = ultimaEntrada(order.statusHistory, "CANCELLED") ?? ultimaEntrada(order.statusHistory, "REJECTED");
  return entrada ? ` el ${cuandoEntrada(entrada)}` : "";
}
