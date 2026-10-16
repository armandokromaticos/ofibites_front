import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";
import { Plus } from "lucide-react";

import { MlProductMiniCardProps } from "./ml-product-mini-card.types";

/**
 * Card compacta de "Agrega a tu pedido" (carrito, Figma 3339:13048): foto 44 px, nombre y precio, y un "+"
 * redondo que abre la ficha. Toda la card responde al clic (el enlace cubre la card con `after:`).
 */
export function MlProductMiniCard({
  name,
  imageSrc,
  priceLabel,
  href,
  linkLabel,
  headingLevel = 3,
  className,
}: MlProductMiniCardProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <article
      className={cn(
        "group relative flex items-center gap-3 rounded-[18px] bg-content1 p-3.5",
        "transition-shadow duration-(--duration-base) ease-out hover:shadow-lift focus-within:shadow-lift",
        className,
      )}
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-sand">
        <Image src={imageSrc} alt="" fill sizes="44px" className="object-cover" />
      </span>
      <div className="min-w-0 flex-1">
        <Heading className="truncate text-[15px] font-semibold leading-5 text-foreground">{name}</Heading>
        <p className="truncate text-[13px] leading-5 text-subtle">{priceLabel}</p>
      </div>
      <Link
        href={href}
        aria-label={linkLabel ?? `Ver ${name}`}
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full border-1 border-primary text-primary",
          "transition-colors duration-(--duration-instant) ease-out group-hover:bg-primary group-hover:text-primary-foreground",
          "after:absolute after:inset-0 after:rounded-[18px]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        )}
      >
        <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
      </Link>
    </article>
  );
}
