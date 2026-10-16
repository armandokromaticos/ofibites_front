"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MlCategoryPickerProps } from "./ml-category-picker.types";

/**
 * Cards de categoría de Ordenar (Figma 3067:17606, "Nuestras categorías"): ilustración sobre `surface-sand`,
 * nombre (Inter Bold 14) y conteo (12) en `brand`; la seleccionada lleva borde `primary`. Botones con
 * `aria-pressed` dentro de un `role="group"`. Las cards (mín. 188 px) crecen para repartir el ancho; si no
 * caben, la fila se desplaza en horizontal dentro de su contenedor (sin scroll de página) y la seleccionada se
 * trae a la vista. Con ratón (`pointer: fine`), botones anterior/siguiente en los bordes cuando hay desborde.
 * Para que la fila llegue al borde de la pantalla, el caller añade margen negativo y padding por `className`.
 */
export function MlCategoryPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: MlCategoryPickerProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ prev: false, next: false });

  // Qué lado tiene categorías ocultas: al desplazar y al cambiar de tamaño (el observer mide también al montar).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const prev = list.scrollLeft > 4;
      const next = list.scrollLeft + list.clientWidth < list.scrollWidth - 4;
      setOverflow((current) =>
        current.prev === prev && current.next === next ? current : { prev, next },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", measure);
    };
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.75, behavior: reduce ? "auto" : "smooth" });
  };

  const arrowClass = cn(
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full",
    "border border-border-subtle bg-content1 text-primary shadow-lift",
    "transition-[scale,background-color] duration-(--duration-instant) ease-out active:scale-95",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
  );

  // La seleccionada (p. ej. `?categoria=bebidas` desde el dashboard) se trae a la vista en la fila con scroll.
  // Solo en horizontal: `scrollIntoView` movería también el `<main>`.
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!list || !selected || list.scrollWidth <= list.clientWidth) return;
    const start = selected.offsetLeft - list.offsetLeft;
    const end = start + selected.offsetWidth;
    if (start < list.scrollLeft || end > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: Math.max(0, start - 16) });
    }
  }, [value]);

  const hasOverflow = overflow.prev || overflow.next;

  const arrow = (direction: 1 | -1) => {
    const isEnd = direction === -1 ? !overflow.prev : !overflow.next;
    const Icon = direction === -1 ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        aria-label={direction === -1 ? "Ver categorías anteriores" : "Ver más categorías"}
        // En el extremo queda inerte pero montado: si tenía el foco, no cae a <body> (tech-rules/atomic).
        aria-disabled={isEnd || undefined}
        onClick={() => !isEnd && scrollBy(direction)}
        className={cn(
          arrowClass,
          "pointer-fine:flex",
          direction === -1 ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
          isEnd ? "cursor-default opacity-40" : "hover:bg-background",
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
    );
  };

  return (
    <div className="relative">
      <div
        ref={listRef}
        role="group"
        aria-label={label}
        className={cn(
          // Cards de al menos 188 px que crecen para repartir el ancho; si no caben, la fila se desplaza.
          "flex snap-x gap-4 overflow-x-auto py-1 [scrollbar-width:none]",
          className,
        )}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "group flex h-[83px] min-w-[188px] flex-[1_0_auto] snap-start items-center gap-[19px]",
                "rounded-[10px] border bg-content1 p-2 pr-3 text-left",
                "transition-[border-color,box-shadow,translate] duration-(--duration-fast) ease-out",
                "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                isSelected
                  ? "border-primary"
                  : "border-transparent hover:border-surface-sand hover:shadow-lift motion-safe:hover:-translate-y-0.5",
              )}
            >
              <span className="relative size-[66px] shrink-0 overflow-hidden rounded-[6px] bg-surface-sand">
                <Image
                  src={option.imageSrc}
                  alt=""
                  fill
                  sizes="66px"
                  className={cn(
                    "object-contain p-1",
                    "motion-safe:transition-[scale,rotate] motion-safe:duration-(--duration-base)",
                    "motion-safe:ease-out motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-105",
                  )}
                />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="line-clamp-2 max-w-[110px] text-sm font-bold leading-[17px] text-brand">
                  {option.name}
                </span>
                {option.caption && <span className="text-xs leading-4 text-brand">{option.caption}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {hasOverflow && arrow(-1)}
      {hasOverflow && arrow(1)}
    </div>
  );
}
