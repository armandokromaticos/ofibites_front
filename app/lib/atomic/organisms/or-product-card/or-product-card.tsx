"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";

import { AtButton } from "@/app/lib/atomic/atoms";
import { MlQuantityStepper } from "@/app/lib/atomic/molecules";

import { OrProductCardProps } from "./or-product-card.types";

export function OrProductCard({
  title,
  description,
  imageSrc,
  imageAlt,
  headingLevel = 3,
  quantity = 1,
  onQuantityChange,
  minQuantity,
  maxQuantity,
  quantityLabel,
  ctaLabel = "Ordenar ahora",
  onCtaPress,
  ctaHref,
  isCtaLoading,
  isHovered = false,
  className,
}: OrProductCardProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <article
      data-hover={isHovered || undefined}
      className={cn(
        "group flex w-[295px] max-w-full flex-col gap-[18px] rounded-card bg-content1 px-[11px] pb-[18px] pt-[9px]",
        className,
      )}
    >
      <div className="relative flex h-[193px] items-center justify-center overflow-hidden rounded-control bg-surface-sand">
        <div
          className={cn(
            "relative h-[165px] w-[240px] max-w-[88%] motion-safe:transition-transform motion-safe:duration-300",
            "motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105",
            "motion-safe:group-data-[hover=true]:-translate-y-1 motion-safe:group-data-[hover=true]:scale-105",
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="240px"
            className="object-contain drop-shadow-product"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-[14px]">
        <Heading className="text-center text-[21px] font-bold leading-5 text-foreground">
          {title}
        </Heading>
        {description && (
          <p className="text-center text-xs leading-5 text-foreground">{description}</p>
        )}
        <div className="flex flex-col gap-[7px]">
          {onQuantityChange && (
            <MlQuantityStepper
              value={quantity}
              onChange={onQuantityChange}
              min={minQuantity}
              max={maxQuantity}
              label={quantityLabel ?? `cantidad de ${title}`}
            />
          )}
          {ctaHref ? (
            <AtButton as={Link} href={ctaHref} fullWidth>
              {ctaLabel}
            </AtButton>
          ) : (
            <AtButton fullWidth onPress={onCtaPress} isLoading={isCtaLoading}>
              {ctaLabel}
            </AtButton>
          )}
        </div>
      </div>
    </article>
  );
}
