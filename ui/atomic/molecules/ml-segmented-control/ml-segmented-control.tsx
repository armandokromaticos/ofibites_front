"use client";

import { useId } from "react";

import { cn } from "@heroui/react";

import { MlSegmentedControlProps } from "./ml-segmented-control.types";

/**
 * Selector segmentado (Figma 3097:28706, "Selecciona la cantidad de personas"): caja de borde `primary` y radio 12
 * con un segmento por opción; el elegido, relleno `primary`. Son radios nativos: Tab entra al grupo y las flechas
 * cambian la elección. La pregunta y el selector van en fila cuando caben (consulta de contenedor) y apilados si no.
 */
export function MlSegmentedControl({
  name,
  label,
  options,
  value,
  onChange,
  isDisabled = false,
  className,
}: MlSegmentedControlProps) {
  const labelId = `${useId()}-label`;

  return (
    <div className={cn("@container", className)}>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-disabled={isDisabled || undefined}
        className="flex flex-col gap-3 @[580px]:flex-row @[580px]:items-center @[580px]:justify-between @[580px]:gap-6"
      >
        <p id={labelId} className="text-sm font-bold leading-[22px] text-primary">
          {label}
        </p>
        <div className="flex h-[46px] w-full overflow-hidden rounded-control border-1 border-primary @[580px]:w-auto">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <label
                key={option.value}
                className={cn(
                  "relative flex min-w-[62px] flex-1 cursor-pointer items-center justify-center px-3",
                  "text-[15px] font-bold tabular-nums leading-6",
                  "transition-colors duration-(--duration-instant) ease-out",
                  // Foco visible dentro de la caja (el borde exterior recortaría un anillo externo).
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-focus",
                  selected
                    ? "bg-primary text-primary-foreground has-[:focus-visible]:outline-primary-foreground"
                    : "text-primary hover:bg-surface-sand/60",
                  isDisabled && "cursor-not-allowed opacity-disabled",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  disabled={isDisabled}
                  onChange={() => onChange(option.value)}
                  aria-label={option.ariaLabel}
                  className="sr-only"
                />
                {/* `truncate` evita que una etiqueta larga (p. ej. "Departamento") envuelva a una segunda
                    línea y la corte el `overflow-hidden`/alto fijo del contenedor. */}
                <span className="truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
