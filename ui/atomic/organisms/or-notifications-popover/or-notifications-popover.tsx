"use client";

import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";

import {
  Bell,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Clock,
  CookingPot,
  FilePen,
  FileText,
  Truck,
} from "lucide-react";

import type { OrderStatus } from "@/domain/models";
import { formatCaracasDateTime, formatCaracasRelative } from "@/shared/utils";
import { AtIconButton, AtPopover, AtSkeleton } from "@/ui/atomic/atoms";
import { MlEmptyState, MlNotificationItem, MlPopoverHeader } from "@/ui/atomic/molecules";

import { OrNotificationsPopoverProps } from "./or-notifications-popover.types";

const STATUS_ICONS: Record<OrderStatus, ReactNode> = {
  CREATED: <FileText />,
  PENDING_APPROVAL: <Clock />,
  PENDING_CONFIRMATION: <Clock />,
  IN_ADJUSTMENT: <FilePen />,
  CONFIRMED: <ClipboardCheck />,
  IN_PREPARATION: <CookingPot />,
  IN_TRANSIT: <Truck />,
  DELIVERED: <CircleCheck />,
  REJECTED: <CircleX />,
  CANCELLED: <CircleX />,
};

/**
 * Notificaciones de la top bar: campana con punto (hay avisos sin leer) que "suena" al abrir, y popover con los
 * últimos avisos y "Marcar como leídas". Los datos y las acciones llegan por props.
 */
export function OrNotificationsPopover({
  items,
  unreadCount,
  status,
  onRetry,
  isRetrying = false,
  onSelect,
  onMarkAllRead,
  isMarkingAllRead = false,
  isOpen: isOpenProp,
  onOpenChange,
  id = "notifications-popover",
}: OrNotificationsPopoverProps) {
  const [isOpenState, setIsOpenState] = useState(false);
  const isOpen = isOpenProp ?? isOpenState;
  // Cada apertura re-monta el icono con la clase del "ring" (la animación vuelve a empezar).
  const [ringKey, setRingKey] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  // "Marcar como leídas" desaparece al no quedar avisos sin leer: el foco pasa al título del panel.
  const focusTitleAfterMarkAll = useRef(false);

  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;
  const now = new Date();

  useEffect(() => {
    if (!focusTitleAfterMarkAll.current || unreadCount > 0) return;
    focusTitleAfterMarkAll.current = false;
    panelRef.current?.querySelector<HTMLElement>(`#${titleId}`)?.focus();
  }, [unreadCount, titleId]);

  // Un aviso sin enlace deja de ser botón al quedar leído: el foco pasa al título para no caer en `<body>`.
  const focusTitleAfterRead = useRef<string | null>(null);
  useEffect(() => {
    const id = focusTitleAfterRead.current;
    if (!id || items.some((item) => item.id === id && item.isUnread)) return;
    focusTitleAfterRead.current = null;
    panelRef.current?.querySelector<HTMLElement>(`#${titleId}`)?.focus();
  }, [items, titleId]);

  const setOpen = (open: boolean) => {
    if (isOpenProp === undefined) setIsOpenState(open);
    if (open) setRingKey((key) => key + 1);
    onOpenChange?.(open);
  };

  // Un aviso con enlace navega: se cierra el panel (la top bar no se re-monta entre rutas).
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a[href]")) setOpen(false);
  };

  return (
    <AtPopover
      isOpen={isOpen}
      onOpenChange={setOpen}
      aria-labelledby={titleId}
      panelId={panelId}
      trigger={
        <AtIconButton
          aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
          aria-controls={isOpen ? panelId : undefined}
          badgeDot={unreadCount > 0}
          badgePing
        >
          <span key={ringKey} aria-hidden="true" className={ringKey ? "ofi-ring flex" : "flex"}>
            <Bell />
          </span>
        </AtIconButton>
      }
    >
      <div ref={panelRef} onClickCapture={closeOnLink} className="flex flex-col">
        <MlPopoverHeader
          title="Notificaciones"
          titleId={titleId}
          action={
            onMarkAllRead && unreadCount > 0 && status === "ready"
              ? {
                  label: "Marcar como leídas",
                  onPress: () => {
                    focusTitleAfterMarkAll.current = true;
                    onMarkAllRead();
                  },
                  isDisabled: isMarkingAllRead,
                }
              : undefined
          }
        />

        {status === "loading" && (
          <div role="status" aria-label="Cargando notificaciones" className="flex flex-col gap-1">
            {[0, 1, 2].map((key) => (
              <div key={key} className="flex items-start gap-2.5 p-2.5">
                <AtSkeleton className="size-7 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
                  <AtSkeleton className="h-3 w-full rounded-full" />
                  <AtSkeleton className="h-2.5 w-1/4 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <MlEmptyState
            size="sm"
            tone="error"
            title="No pudimos cargar tus avisos"
            description="Revisa tu conexión e inténtalo de nuevo."
            actionLabel={onRetry ? "Reintentar" : undefined}
            onAction={onRetry}
            isActionLoading={isRetrying}
          />
        )}

        {status === "ready" && items.length === 0 && (
          <MlEmptyState
            size="sm"
            icon={<Bell />}
            title="Todo al día"
            description="Aquí te avisaremos cuando tus pedidos cambien de estado."
          />
        )}

        {status === "ready" && items.length > 0 && (
          <ul aria-label="Últimas notificaciones" className="-mx-1 flex max-h-[min(360px,60vh)] flex-col overflow-y-auto px-1">
            {items.map((item) => (
              <li key={item.id}>
                <MlNotificationItem
                  message={item.message}
                  icon={item.orderStatus ? STATUS_ICONS[item.orderStatus] : <Bell />}
                  isUnread={item.isUnread}
                  dateLabel={formatCaracasRelative(item.createdAt, now)}
                  dateTime={item.createdAt}
                  dateTitle={formatCaracasDateTime(item.createdAt)}
                  href={item.href}
                  onPress={
                    item.href || item.isUnread
                      ? () => {
                          if (!item.href) focusTitleAfterRead.current = item.id;
                          onSelect?.(item);
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AtPopover>
  );
}
