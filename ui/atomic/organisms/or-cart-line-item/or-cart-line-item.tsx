"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";

import { AtChip, AtSkeleton } from "@/ui/atomic/atoms";
import { MlQuantityStepper } from "@/ui/atomic/molecules";

import { OrCartLineItemProps } from "./or-cart-line-item.types";

/**
 * Línea de la página del carrito (Figma 3339:13048): foto 88 px, nombre, descripción, etiquetas, precio por
 * unidad; a la derecha, subtotal de la línea, cantidad y "Eliminar". En móvil la cantidad baja bajo el texto.
 */
export function OrCartLineItem({
  name,
  imageSrc,
  href,
  description,
  tags = [],
  unitPriceLabel,
  subtotalLabel,
  quantity,
  onQuantityChange,
  isUpdating = false,
  notice,
  isQuantityDisabled = false,
  onRemove,
  isRemoving = false,
  removeButtonRef,
  headingLevel = 3,
  className,
}: OrCartLineItemProps) {
  const Heading = `h${headingLevel}` as const;
  const label = name ?? "producto";

  return (
    <article
      aria-busy={isRemoving || undefined}
      className={cn(
        "grid grid-cols-[64px_1fr] gap-x-4 gap-y-3 py-[18px] sm:grid-cols-[88px_1fr_auto] sm:gap-x-[34px]",
        isRemoving && "opacity-50 transition-opacity duration-(--duration-fast)",
        className,
      )}
    >
      <span className="relative size-16 overflow-hidden rounded-control bg-surface-sand sm:size-[88px]">
        <Image src={imageSrc} alt="" fill sizes="88px" className="object-cover" />
      </span>

      <div className="min-w-0">
        {name ? (
          <Heading className="text-base font-bold leading-6 text-foreground sm:text-[19px]">
            {href ? (
              <Link
                href={href}
                className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </Heading>
        ) : (
          <AtSkeleton className="my-1.5 h-4 w-48 max-w-full rounded-full" />
        )}
        {description && <p className="mt-0.5 text-[13px] leading-5 text-foreground">{description}</p>}
        {tags.length > 0 && (
          <ul aria-label="Etiquetas" className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag}>
                <AtChip className="h-[22px] px-1 text-[10px] font-semibold">{tag}</AtChip>
              </li>
            ))}
          </ul>
        )}
        {unitPriceLabel && (
          <p className="mt-2 text-xs leading-5 text-secondary-600">{unitPriceLabel} por unidad</p>
        )}
        {notice && <p className="mt-2 text-xs font-medium leading-5 text-danger-700">{notice}</p>}
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
        <p
          className={cn(
            "order-2 text-[17px] font-bold leading-6 text-foreground tabular-nums sm:order-none",
            isUpdating && "text-muted",
          )}
          aria-live="polite"
        >
          <span className="sr-only">Subtotal de {label}: </span>
          {subtotalLabel}
        </p>
        <div className="order-1 flex items-center gap-3 sm:order-none sm:flex-col sm:items-end sm:gap-1.5">
          <MlQuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            min={1}
            label={`cantidad de ${label}`}
            isDisabled={isQuantityDisabled}
            className="h-8 w-[100px]"
          />
          <button
            ref={removeButtonRef}
            type="button"
            onClick={isRemoving ? undefined : onRemove}
            aria-disabled={isRemoving || undefined}
            aria-label={`Eliminar ${label}`}
            className={cn(
              "rounded-sm text-xs leading-5 text-muted underline-offset-2 hover:text-foreground hover:underline",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              "aria-disabled:cursor-progress",
            )}
          >
            {isRemoving ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </article>
  );
}
