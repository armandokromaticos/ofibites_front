import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";
import { Plus } from "lucide-react";

import { OrCatalogCardProps } from "./or-catalog-card.types";

/**
 * Card de surtido del catálogo (Ordenar, Figma 3067:17606): imagen sobre `surface-sand` con badges
 * ("POPULAR" en `highlight`, "En oferta"), nombre Inter Bold 19, descripción, rango de precio y botón "+"
 * que abre la ficha. El "+" es el único enlace (un solo tab por card) y se estira a toda la card con `after:`
 * para que cualquier clic la abra. Hover: sube 6 px con sombra pasajera, como `OrProductCard`.
 */
export function OrCatalogCard({
  name,
  description,
  imageSrc,
  imageAlt,
  priceLabel,
  href,
  linkLabel,
  isFeatured = false,
  isOnSale = false,
  headingLevel = 3,
  preloadImage = false,
  className,
}: OrCatalogCardProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-card bg-content1 p-4 pb-5",
        "transition-[translate,box-shadow] duration-(--duration-base) ease-out",
        "hover:shadow-lift-card focus-within:shadow-lift-card",
        "motion-safe:hover:-translate-y-1.5 motion-safe:focus-within:-translate-y-1.5",
        className,
      )}
    >
      <div className="relative aspect-[297/294] overflow-hidden rounded-2xl bg-surface-sand">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          preload={preloadImage}
          sizes="(min-width: 1280px) 340px, (min-width: 640px) 45vw, 92vw"
          className={cn(
            // Sin padding ni sombra: las fotos de surtido traen su fondo (como en el Figma) y llenan la caja.
            "object-contain",
            "motion-safe:transition-[scale,translate] motion-safe:duration-(--duration-slow) motion-safe:ease-out",
            "motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105",
            "motion-safe:group-focus-within:-translate-y-1 motion-safe:group-focus-within:scale-105",
          )}
        />
        {(isFeatured || isOnSale) && (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {isFeatured && (
              <span className="inline-flex h-[34px] items-center rounded-full bg-highlight px-4 text-[13px] font-medium uppercase tracking-[0.08em] text-foreground">
                Popular
              </span>
            )}
            {isOnSale && (
              <span className="inline-flex h-[34px] items-center rounded-full bg-content1 px-4 text-[13px] font-semibold text-secondary-700">
                En oferta
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 px-1">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Heading className="line-clamp-2 text-balance text-[19px] font-bold leading-5 text-foreground">
            {name}
          </Heading>
          {description && <p className="line-clamp-2 text-xs leading-[18px] text-foreground">{description}</p>}
          <p className="mt-1 text-[15px] font-bold tabular-nums text-primary">{priceLabel}</p>
        </div>
        <Link
          href={href}
          aria-label={linkLabel ?? `Ver ${name}`}
          className={cn(
            "flex size-[50px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground",
            "transition-[background-color,scale] duration-(--duration-instant) ease-out",
            "group-hover:bg-brand active:scale-95",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            // Toda la card es zona de clic del enlace.
            "after:absolute after:inset-0 after:rounded-card after:content-['']",
          )}
        >
          <Plus aria-hidden="true" className="size-6" strokeWidth={2.25} />
        </Link>
      </div>
    </article>
  );
}
