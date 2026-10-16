"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MlCarouselRowProps } from "./ml-carousel-row.types";

const ARROW = cn(
  "absolute top-1/2 z-10 hidden size-[49px] -translate-y-1/2 items-center justify-center rounded-full md:flex",
  "bg-content1 text-primary shadow-lift",
  "transition-[opacity,scale] duration-(--duration-instant) ease-out active:scale-95",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
);

/**
 * Fila horizontal deslizable con flechas (el "Carrusel" de recomendaciones del Figma, 3151:2410). Es una lista con
 * scroll nativo y `scroll-snap`: táctil, rueda y teclado (Tab lleva cada elemento a la vista) funcionan sin JS.
 * Las flechas (desde `md`) avanzan casi un ancho de fila y se atenúan en los extremos (`aria-disabled`, siguen
 * enfocables). Con movimiento reducido, el desplazamiento es instantáneo.
 */
export function MlCarouselRow({
  label,
  items,
  itemClassName = "w-[300px] sm:w-[332px]",
  className,
}: MlCarouselRowProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    setEdges({ start: list.scrollLeft <= 4, end: list.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [update, items.length]);

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        id={listId}
        ref={listRef}
        aria-label={label}
        onScroll={update}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-[27px]",
          "motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Aire para que la card que sube al pasar no se recorte arriba.
          "-mt-2 pt-2",
        )}
      >
        {items.map((item, i) => (
          <li key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label="Ver anteriores"
        aria-controls={listId}
        aria-disabled={edges.start || undefined}
        onClick={() => !edges.start && scrollBy(-1)}
        className={cn(ARROW, "-left-3", edges.start && "cursor-not-allowed opacity-40")}
      >
        <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        aria-label="Ver siguientes"
        aria-controls={listId}
        aria-disabled={edges.end || undefined}
        onClick={() => !edges.end && scrollBy(1)}
        className={cn(ARROW, "-right-3", edges.end && "cursor-not-allowed opacity-40")}
      >
        <ChevronRight aria-hidden="true" className="size-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
