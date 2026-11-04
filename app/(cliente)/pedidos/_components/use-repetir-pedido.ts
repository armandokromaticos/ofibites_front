"use client";

import { RefObject, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useRepeatOrder } from "@/domain/hooks/cart";
import { useCartNoticeStore } from "@/domain/stores";
import { Order } from "@/domain/types";
import { OrConfirmModalProps } from "@/ui/atomic";

import { avisoPedidoRepetido, mensajeErrorRepetir } from "../../_data/repetir-pedido";
import { RUTA_CARRITO } from "../../_navegacion";

/** Lo que necesita la confirmación (Figma `3568:1611`) para repetir un pedido. */
export interface PedidoARepetir {
  id: string;
  /** Número visible, sin "#". */
  numero: string;
  /** `Order.orderNumber` para el aviso del carrito (sin él, "de tu último pedido"). */
  orderNumber?: string;
  /** Líneas del pedido, para el texto de la confirmación; `null` si la respuesta no las trae. */
  lineas: number | null;
}

/**
 * Criterio único (detalle y lista) para ofrecer "Repetir pedido": que el pedido tenga líneas. Si la respuesta no
 * trae `items`, se ofrece igual y el back decide (400 si ninguna línea sigue disponible).
 */
export function sePuedeRepetir(order: Pick<Order, "items">): boolean {
  return order.items === undefined || order.items.length > 0;
}

export function pedidoARepetir(order: Pick<Order, "id" | "orderNumber" | "items">): PedidoARepetir {
  return {
    id: order.id,
    numero: order.orderNumber ?? order.id.slice(-8).toUpperCase(),
    orderNumber: order.orderNumber ?? undefined,
    lineas: order.items?.length ?? null,
  };
}

function descripcion(lineas: number | null): string {
  const que = lineas === null ? "sus productos" : lineas === 1 ? "este producto" : `estos ${lineas} productos`;
  return `Vamos a cargar ${que} en tu carrito. Ahí eliges la fecha de entrega y ajustas cantidades antes de confirmar.`;
}

/**
 * Flujo "Repetir pedido" compartido por el detalle (`/pedidos/[id]`) y el menú "···" de la lista: confirmación con
 * `OrConfirmModal` → `POST /cart/repeat/:orderId` → aviso en el carrito y navegación a `/carrito`. Con error no
 * navega: deja el mensaje en `error` y mueve el foco a `errorRef` (el `role="alert"` que pinta la pantalla, que es
 * dueña del ref: devolverlo desde el hook haría que react-hooks/refs marcase todo su resultado).
 */
export function useRepetirPedido(errorRef: RefObject<HTMLElement | null>) {
  const router = useRouter();
  const repeat = useRepeatOrder();
  const setCartNotice = useCartNoticeStore((state) => state.setNotice);

  const [isOpen, setIsOpen] = useState(false);
  // Se conserva al cerrar para que el título no cambie durante la animación de salida.
  const [objetivo, setObjetivo] = useState<PedidoARepetir | null>(null);
  const [error, setError] = useState<{ orderId: string; message: string } | null>(null);
  // Doble clic en "Cargar en el carrito": el segundo llega antes de que `isPending` se pinte.
  const repitiendo = useRef(false);

  const abrir = (pedido: PedidoARepetir) => {
    setError(null);
    setObjetivo(pedido);
    setIsOpen(true);
  };

  const confirmar = () => {
    if (!objetivo || repitiendo.current) return;
    repitiendo.current = true;
    const pedido = objetivo;
    repeat
      .mutateAsync(pedido.id)
      .then((resultado) => {
        setIsOpen(false);
        setCartNotice(avisoPedidoRepetido(resultado, pedido.orderNumber));
        router.push(RUTA_CARRITO);
      })
      .catch((err: unknown) => {
        repitiendo.current = false;
        setIsOpen(false);
        setError({ orderId: pedido.id, message: mensajeErrorRepetir(err) });
        requestAnimationFrame(() => errorRef.current?.focus());
      });
  };

  const modalProps: OrConfirmModalProps = {
    isOpen,
    onClose: () => setIsOpen(false),
    onConfirm: confirmar,
    title: objetivo ? `Repetir el pedido #${objetivo.numero}` : "Repetir el pedido",
    description: descripcion(objetivo?.lineas ?? null),
    confirmLabel: "Cargar en el carrito",
    isConfirming: repeat.isPending,
  };

  return {
    abrir,
    modalProps,
    error,
    isPending: repeat.isPending,
    /** Id del pedido que se está repitiendo (para deshabilitar su fila). */
    pedidoEnCurso: repeat.isPending ? (objetivo?.id ?? null) : null,
  };
}
