"use client";

import { cn } from "@heroui/react";

import { MlFilterChipsProps } from "./ml-filter-chips.types";

/**
 * Chips de filtro de la entrega de diseño (dashboard, "Según tus preferencias"): píldoras de 30 px,
 * borde `surface-sand`, fondo blanco, 12 px semibold `primary`; hover con borde `primary`; activo relleno
 * `primary` con texto blanco. Botones con `aria-pressed` dentro de un `role="group"`, navegables con Tab.
 * En pantallas estrechas el grupo hace scroll horizontal (no desborda la página).
 * No es un formulario: para elegir un valor en un formulario usa `MlChoiceChips`.
 */
export function MlFilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: MlFilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex max-w-full gap-2 overflow-x-auto p-0.5 [scrollbar-width:none]", className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-[30px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold",
              "transition-colors duration-(--duration-fast) ease-out",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-surface-sand bg-content1 text-primary hover:border-primary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
