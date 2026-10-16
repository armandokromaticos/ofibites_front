"use client";

import { cn } from "@heroui/react";

import { MlFilterChipsProps } from "./ml-filter-chips.types";

/**
 * Chips de filtro de la entrega de diseño (dashboard, "Según tus preferencias"): píldoras de 30 px,
 * borde `surface-sand`, fondo blanco, 12 px semibold `primary`; hover con borde `primary`; activo relleno
 * `primary` con texto blanco. Botones con `aria-pressed` dentro de un `role="group"`, navegables con Tab.
 * En pantallas estrechas el grupo hace scroll horizontal (no desborda la página).
 * Con `appearance="pills"`, los filtros de Ordenar (Figma 3067:17606): blancas de 40 px, activa en `nav-active`.
 * No es un formulario: para elegir un valor en un formulario usa `MlChoiceChips`.
 */
export function MlFilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  appearance = "chips",
  orientation = "horizontal",
  className,
}: MlFilterChipsProps<T>) {
  const isPills = appearance === "pills";

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex max-w-full p-0.5",
        orientation === "vertical"
          ? "flex-col items-start gap-2.5"
          : "gap-2 overflow-x-auto [scrollbar-width:none]",
        className,
      )}
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
              "shrink-0 whitespace-nowrap rounded-full border",
              "transition-colors duration-(--duration-fast) ease-out",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              isPills
                ? cn(
                    "h-10 px-5 text-sm text-foreground",
                    isActive
                      ? "border-nav-active bg-nav-active font-bold"
                      : "border-content1 bg-content1 hover:border-surface-sand",
                  )
                : cn(
                    "h-[30px] px-3.5 text-xs font-semibold",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-surface-sand bg-content1 text-primary hover:border-primary",
                  ),
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
