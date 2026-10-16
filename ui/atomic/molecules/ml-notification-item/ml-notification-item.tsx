"use client";

import Link from "next/link";

import { cn } from "@heroui/react";

import { MlNotificationItemProps } from "./ml-notification-item.types";

/**
 * Aviso de la lista de notificaciones: icono en cuadro `brand-soft`, mensaje (en negrita si no está leído) y
 * antigüedad. Es un enlace si lleva `href`; si no, un botón (p. ej. solo marca como leído).
 */
export function MlNotificationItem({
  message,
  icon,
  isUnread = false,
  dateLabel,
  dateTime,
  dateTitle,
  href,
  onPress,
  className,
}: MlNotificationItemProps) {
  const classes = cn(
    "group flex w-full items-start gap-2.5 rounded-control p-2.5 text-left",
    "transition-colors duration-(--duration-fast) ease-out hover:bg-background",
    "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus",
    className,
  );

  const content = (
    <>
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary [&_svg]:size-3.5"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-pretty text-[12.5px] leading-[1.4] text-foreground",
            isUnread ? "font-semibold" : "font-normal",
          )}
        >
          {isUnread && <span className="sr-only">Sin leer: </span>}
          {message}
        </span>
        <time dateTime={dateTime} title={dateTitle} className="mt-0.5 block text-[11px] leading-4 text-subtle">
          {dateLabel}
        </time>
      </span>
      {isUnread && <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-accent" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onPress} className={classes}>
        {content}
      </Link>
    );
  }

  // Sin enlace ni acción (aviso ya leído que no lleva a ninguna página): texto, no control.
  if (!onPress) {
    return <div className={cn(classes, "hover:bg-transparent")}>{content}</div>;
  }

  return (
    <button type="button" onClick={onPress} className={classes}>
      {content}
    </button>
  );
}
