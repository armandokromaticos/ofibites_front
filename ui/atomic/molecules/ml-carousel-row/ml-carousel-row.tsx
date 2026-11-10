"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@heroui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { MlCarouselRowProps } from "./ml-carousel-row.types";

// Figma 3151:2135: zona de 49 px con un círculo gris de 41 px y una flecha `brand` de trazo 2, sobre las cards
// (a 14 px del borde de la fila). El círculo es el `span` interior; el botón conserva el área táctil.
const ARROW = cn(
  "absolute top-1/2 z-10 hidden size-[49px] -translate-y-1/2 items-center justify-center rounded-full md:flex",
  "text-brand",
  "transition-[opacity,scale] duration-(--duration-instant) ease-out active:scale-95",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
);

const ARROW_CIRCLE = "flex size-[41px] items-center justify-center rounded-full bg-control-fill";

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
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth sm:gap-[27px]",
          "motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // `overflow-x` también recorta en vertical: aire alrededor (anulado con margen negativo) para que la card que
          // sube al pasar y su `shadow-lift-card` (hasta ~36 px abajo y ~14 a los lados) no se corten. Simétrico en
          // vertical para que las flechas sigan centradas; `scroll-px` alinea el snap con el borde real de la fila.
          "-mx-4 -my-10 scroll-px-4 px-4 py-10",
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
        className={cn(ARROW, "left-[10px]", edges.start && "cursor-not-allowed opacity-40")}
      >
        <span aria-hidden="true" className={ARROW_CIRCLE}>
          <ArrowLeft className="size-6" strokeWidth={2} />
        </span>
      </button>
      <button
        type="button"
        aria-label="Ver siguientes"
        aria-controls={listId}
        aria-disabled={edges.end || undefined}
        onClick={() => !edges.end && scrollBy(1)}
        className={cn(ARROW, "right-[10px]", edges.end && "cursor-not-allowed opacity-40")}
      >
        <span aria-hidden="true" className={ARROW_CIRCLE}>
          <ArrowRight className="size-6" strokeWidth={2} />
        </span>
      </button>
    </div>
  );
}
