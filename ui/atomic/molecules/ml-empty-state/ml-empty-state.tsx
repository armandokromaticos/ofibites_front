"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";

import { AtButton } from "@/ui/atomic/atoms";

import { MlEmptyStateProps } from "./ml-empty-state.types";

/**
 * Estado vacío o de error (copy del Figma: "Tu carrito está vacío", "Todavía no has hecho ningún pedido").
 * No pinta card: el caller decide el contenedor. Título en Playfair Bold, como en el Figma (22 px en `md`).
 */
export function MlEmptyState({
  title,
  description,
  icon,
  illustrationSrc,
  titleTone = "foreground",
  actionVariant = "solid",
  tone = "neutral",
  size = "md",
  headingLevel = 3,
  actionLabel,
  actionHref,
  onAction,
  isActionLoading,
  className,
}: MlEmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  const isError = tone === "error";
  const isSmall = size === "sm";
  const actionProps =
    actionVariant === "bordered"
      ? ({ variant: "bordered", color: "primary", className: "mt-2 border-1 border-primary text-primary" } as const)
      : ({ className: "mt-2" } as const);

  return (
    <div
      role={isError ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center text-center",
        isSmall ? "gap-2 py-4" : "gap-3 px-6 py-10",
        className,
      )}
    >
      {illustrationSrc ? (
        <Image src={illustrationSrc} alt="" width={49} height={44} className="mb-1 shrink-0" />
      ) : icon && (
        <span
          aria-hidden="true"
          className={cn(
            "mb-1 flex shrink-0 items-center justify-center rounded-full",
            isSmall ? "size-10 [&_svg]:size-5" : "size-14 [&_svg]:size-6",
            isError ? "bg-danger-50 text-danger-700" : "bg-surface-sand text-brand",
          )}
        >
          {icon}
        </span>
      )}
      <Heading
        className={cn(
          "text-balance font-display font-bold",
          titleTone === "brand" ? "text-brand" : "text-foreground",
          isSmall ? "text-lg leading-6" : "text-[22px] leading-7",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "max-w-[42ch] text-pretty text-muted",
            isSmall ? "text-[13px] leading-5" : "text-sm leading-[22px]",
          )}
        >
          {description}
        </p>
      )}
      {actionLabel &&
        (actionHref ? (
          <AtButton as={Link} href={actionHref} size="sm" {...actionProps} onPress={onAction}>
            {actionLabel}
          </AtButton>
        ) : (
          <AtButton size="sm" {...actionProps} onPress={onAction} isLoading={isActionLoading}>
            {actionLabel}
          </AtButton>
        ))}
    </div>
  );
}
