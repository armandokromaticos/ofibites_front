"use client";

import Image from "next/image";

import { cn, Spinner } from "@heroui/react";
import { X } from "lucide-react";

import { AtSkeleton } from "@/ui/atomic/atoms";

import { MlCartLineProps } from "./ml-cart-line.types";

/** Línea del resumen del carrito (popover de la top bar): foto 44 × 32, nombre, detalle y "Quitar". */
export function MlCartLine({
  name,
  imageSrc,
  detail,
  onRemove,
  isRemoving = false,
  isRemoveDisabled = false,
  removeButtonRef,
  className,
}: MlCartLineProps) {
  const label = name ?? "producto";

  return (
    <div
      className={cn(
        "ofi-slide-in flex items-center gap-2.5 rounded-control bg-background p-2",
        isRemoving && "opacity-60 transition-opacity duration-(--duration-fast)",
        className,
      )}
    >
      <span className="relative h-8 w-11 shrink-0 overflow-hidden rounded-md bg-surface-sand">
        <Image src={imageSrc} alt="" fill sizes="44px" className="object-cover" />
      </span>
      <div className="min-w-0 flex-1">
        {name ? (
          <p className="truncate text-[13px] font-semibold leading-5 text-foreground">{name}</p>
        ) : (
          <AtSkeleton className="my-1 h-3 w-3/4 rounded-full" />
        )}
        <p className="truncate text-[11px] leading-4 text-muted">{detail}</p>
      </div>
      {onRemove && (
        <button
          ref={removeButtonRef}
          type="button"
          onClick={isRemoving || isRemoveDisabled ? undefined : onRemove}
          aria-disabled={isRemoving || isRemoveDisabled || undefined}
          aria-label={`Quitar ${label}`}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md text-muted",
            "transition-colors duration-(--duration-instant) ease-out hover:bg-surface-sand hover:text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
            isRemoving ? "aria-disabled:cursor-progress" : "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
          )}
        >
          {isRemoving ? (
            <Spinner size="sm" color="current" aria-label={`Quitando ${label}`} classNames={{ wrapper: "size-3.5" }} />
          ) : (
            <X aria-hidden="true" className="size-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
