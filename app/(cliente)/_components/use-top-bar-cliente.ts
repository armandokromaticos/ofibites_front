"use client";

import { useState } from "react";

import { useCart, useCartLines, useClearCart, useRemoveCartItem } from "@/domain/hooks/cart";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/domain/hooks/notifications";
import { CartLineModel } from "@/domain/models";
import { useAuthStore } from "@/domain/stores";
import { isApiError } from "@/shared/utils";
import type {
  OrCartPopoverLine,
  OrCartPopoverProps,
  OrCartPopoverStatus,
  OrNotificationsPopoverProps,
} from "@/ui/atomic";

import { mensajeErrorCarrito } from "../_data/errores-carrito";
import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../_data/imagenes";
import { RUTA_CARRITO, RUTA_ORDENAR, tienePaginaCliente } from "../_navegacion";

/** Cuántos avisos muestra la campana. */
const NOTIFICACIONES_EN_CAMPANA = 10;

function detalleLinea(line: CartLineModel): string {
  const unidades = `${line.quantity} ${line.quantity === 1 ? "unidad" : "unidades"}`;
  const detalle = line.servingsLabel ? `${unidades} · ${line.servingsLabel}` : unidades;
  return line.isAvailable ? detalle : `No disponible · ${detalle}`;
}

function toPopoverLine(line: CartLineModel): OrCartPopoverLine {
  return {
    id: line.id,
    name: line.name,
    imageSrc: line.imageSrc ?? IMAGEN_PRODUCTO_POR_DEFECTO,
    detail: detalleLinea(line),
  };
}

/**
 * Datos y acciones de la top bar del cliente (carrito y notificaciones) para `TmAppLayout`. La top bar no conoce
 * los servicios: todo entra por props desde aquí.
 */
export function useTopBarCliente(): {
  cart: OrCartPopoverProps;
  notifications: OrNotificationsPopoverProps;
} {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Carrito (`GET /cart`, con nombre, foto, tamaño y disponibilidad de cada línea).
  const cartQuery = useCart();
  const lines = useCartLines(cartQuery.data);
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  let cartStatus: OrCartPopoverStatus;
  if (!companyId) cartStatus = "unavailable";
  else if (cartQuery.data) cartStatus = "ready";
  else if (cartQuery.isError) {
    cartStatus = isApiError(cartQuery.error) && cartQuery.error.statusCode === 403 ? "unavailable" : "error";
  } else cartStatus = "loading";

  // Notificaciones (`GET /notifications?take=10`).
  const notificationsQuery = useNotifications({ take: NOTIFICACIONES_EN_CAMPANA });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const page = notificationsQuery.data;

  return {
    cart: {
      count: cartQuery.data?.totalUnits ?? 0,
      status: cartStatus,
      lines: lines.map(toPopoverLine),
      cartHref: RUTA_CARRITO,
      browseHref: RUTA_ORDENAR,
      onRetry: () => void cartQuery.refetch(),
      isRetrying: cartQuery.isFetching,
      removingLineId: removeItem.isPending ? (removeItem.variables ?? null) : null,
      onRemoveLine: (lineId) => {
        if (removeItem.isPending) return;
        setActionError(null);
        removeItem.mutate(lineId, {
          onError: (error) => {
            setActionError(mensajeErrorCarrito(error, "quitar"));
            if (isApiError(error) && error.statusCode === 404) void cartQuery.refetch();
          },
        });
      },
      isClearing: clearCart.isPending,
      onClear: () => {
        setActionError(null);
        clearCart.mutate(undefined, {
          onError: (error) => setActionError(mensajeErrorCarrito(error, "vaciar")),
        });
      },
      actionError,
      isOpen: isCartOpen,
      onOpenChange: (open) => {
        setIsCartOpen(open);
        if (!open) setActionError(null);
      },
    },
    notifications: {
      items: (page?.data ?? []).map((notification) => ({
        id: notification.id,
        message: notification.message,
        isUnread: notification.readAt === null,
        orderStatus: notification.orderStatus,
        createdAt: notification.createdAt,
        // `/pedidos/<id>` aún no tiene página: sin enlace, el aviso solo se marca como leído.
        href: notification.link && tienePaginaCliente(notification.link) ? notification.link : null,
      })),
      unreadCount: page?.unreadCount ?? 0,
      status: page ? "ready" : notificationsQuery.isError ? "error" : "loading",
      onRetry: () => void notificationsQuery.refetch(),
      isRetrying: notificationsQuery.isFetching,
      onSelect: (item) => {
        if (item.isUnread) markRead.mutate(item.id);
      },
      onMarkAllRead: () => markAllRead.mutate(),
      isMarkingAllRead: markAllRead.isPending,
    },
  };
}
