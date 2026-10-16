"use client";

import { cn } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MlPaginationProps } from "./ml-pagination.types";

type Slot = number | "inicio" | "fin";

/** Páginas visibles: todas hasta 7; si hay más, primera, última y la actual con sus vecinas (con "…"). */
function slots(page: number, total: number): Slot[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - 1, total - 4));
  const end = Math.min(total - 1, Math.max(page + 1, 5));
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  // Un hueco de una sola página muestra el número: "…" solo si oculta dos o más.
  const inicio: Slot[] = start === 3 ? [2] : start > 3 ? ["inicio"] : [];
  const fin: Slot[] = end === total - 2 ? [total - 1] : end < total - 2 ? ["fin"] : [];
  return [1, ...inicio, ...middle, ...fin, total];
}

const BUTTON = cn(
  "flex size-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
  "transition-colors duration-(--duration-fast) ease-out",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
);

/**
 * Paginación numerada: anterior, páginas y siguiente, en píldoras de 40 px. La actual en `primary` con
 * `aria-current="page"`. En los extremos, anterior/siguiente quedan `aria-disabled` (no `disabled`: el foco no
 * cae a `<body>` si se estaba sobre ellos, tech-rules/atomic).
 */
export function MlPagination({ page, totalPages, onChange, label, className }: MlPaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav aria-label={label} className={cn("flex justify-center", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          <button
            type="button"
            aria-label="Página anterior"
            aria-disabled={isFirst || undefined}
            onClick={() => !isFirst && onChange(page - 1)}
            className={cn(BUTTON, "bg-content1 text-primary", isFirst ? "cursor-default opacity-40" : "hover:bg-surface-sand")}
          >
            <ChevronLeft aria-hidden="true" className="size-[18px]" />
          </button>
        </li>
        {slots(page, totalPages).map((slot) =>
          typeof slot === "number" ? (
            <li key={slot}>
              <button
                type="button"
                aria-label={`Página ${slot}`}
                aria-current={slot === page ? "page" : undefined}
                onClick={() => slot !== page && onChange(slot)}
                className={cn(
                  BUTTON,
                  slot === page
                    ? "bg-primary text-primary-foreground"
                    : "bg-content1 text-primary hover:bg-surface-sand",
                )}
              >
                {slot}
              </button>
            </li>
          ) : (
            <li key={slot} aria-hidden="true" className="flex size-10 items-center justify-center text-sm text-muted">
              …
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label="Página siguiente"
            aria-disabled={isLast || undefined}
            onClick={() => !isLast && onChange(page + 1)}
            className={cn(BUTTON, "bg-content1 text-primary", isLast ? "cursor-default opacity-40" : "hover:bg-surface-sand")}
          >
            <ChevronRight aria-hidden="true" className="size-[18px]" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
