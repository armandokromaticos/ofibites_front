import Image from "next/image";
import Link from "next/link";

import { cn, Spinner } from "@heroui/react";
import { Plus } from "lucide-react";

import { MlProductMiniCardProps } from "./ml-product-mini-card.types";

const PLUS = cn(
  "grid size-7 shrink-0 place-items-center rounded-full border-1 border-primary text-primary",
  "transition-colors duration-(--duration-instant) ease-out",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
);

/**
 * Card compacta de "Agrega a tu pedido" (carrito, Figma 3339:13048): foto 44 px, nombre y precio, y un "+"
 * redondo. Toda la card abre la ficha (el enlace la cubre con `after:`).
 * - Sin `onAdd`, el "+" es ese enlace.
 * - Con `onAdd` (el ítem se puede añadir sin elegir nada), el enlace es el nombre y el "+" es un botón encima que
 *   añade al carrito sin salir; mientras añade, muestra un spinner y queda `aria-disabled`.
 */
export function MlProductMiniCard({
  name,
  imageSrc,
  priceLabel,
  href,
  linkLabel,
  onAdd,
  isAdding = false,
  addLabel,
  headingLevel = 3,
  className,
}: MlProductMiniCardProps) {
  const Heading = `h${headingLevel}` as const;
  const cubreLaCard = "after:absolute after:inset-0 after:rounded-[18px]";

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
        <Heading className="truncate text-[15px] font-semibold leading-5 text-foreground">
          {onAdd ? (
            <Link
              href={href}
              aria-label={linkLabel}
              className={cn(
                cubreLaCard,
                "rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              )}
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </Heading>
        <p className="truncate text-[13px] leading-5 text-subtle">{priceLabel}</p>
      </div>
      {onAdd ? (
        <button
          type="button"
          aria-label={addLabel ?? `Añadir ${name} al carrito`}
          aria-disabled={isAdding || undefined}
          onClick={() => !isAdding && onAdd()}
          // Encima del enlace que cubre la card (`z-10`).
          className={cn(PLUS, "relative z-10 hover:bg-primary hover:text-primary-foreground", isAdding && "cursor-wait")}
        >
          {isAdding ? (
            <Spinner size="sm" color="current" classNames={{ wrapper: "size-3.5" }} />
          ) : (
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          )}
        </button>
      ) : (
        <Link
          href={href}
          aria-label={linkLabel ?? `Ver ${name}`}
          className={cn(PLUS, "group-hover:bg-primary group-hover:text-primary-foreground", cubreLaCard)}
        >
          <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
        </Link>
      )}
    </article>
  );
}
