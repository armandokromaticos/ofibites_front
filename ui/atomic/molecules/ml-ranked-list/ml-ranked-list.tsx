import { cn } from "@heroui/react";

import { MlRankedListProps } from "./ml-ranked-list.types";

/** Lista de ranking (Figma "Top productos del mes" `3706:2856`): posición, nombre y cantidad por fila. */
export function MlRankedList({ items, className }: MlRankedListProps) {
  return (
    <ol className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, index) => (
        <li key={item.key} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-semibold leading-none text-brand"
          >
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium leading-5 text-foreground">{item.label}</span>
          <span className="shrink-0 text-xs font-semibold leading-5 text-foreground tabular-nums">{item.quantityLabel}</span>
        </li>
      ))}
    </ol>
  );
}
