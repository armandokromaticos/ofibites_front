"use client";

import { useId } from "react";

import { cn } from "@heroui/react";

import { MlRadioCardGroupProps } from "./ml-radio-card-group.types";

/**
 * Tarjetas de elección única (Figma 3462:2094, "¿Dónde lo recibimos?"): borde `surface-sand` y radio 12; la
 * elegida, borde `brand` de 2 px y el punto relleno en `primary`. Son radios nativos: Tab entra al grupo y las
 * flechas cambian la elección. El grupo lo nombra un título de fuera (`labelledBy`).
 */
export function MlRadioCardGroup({
  name,
  labelledBy,
  describedBy,
  options,
  value,
  onChange,
  isInvalid = false,
  errorMessage,
  isDisabled = false,
  className,
}: MlRadioCardGroupProps) {
  const errorId = `${useId()}-error`;
  const descriptionIds =
    [describedBy, isInvalid && errorMessage ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-describedby={descriptionIds}
        aria-invalid={isInvalid || undefined}
        className="flex flex-col gap-2.5"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3.5 rounded-control border bg-content1 px-4 py-3.5 sm:px-[18px]",
                "transition-[border-color,box-shadow,background-color] duration-(--duration-instant) ease-out",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                selected
                  ? "border-brand shadow-[inset_0_0_0_1px_var(--color-brand)]"
                  : "border-surface-sand hover:border-border-input",
                isInvalid && !selected && "border-accent",
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
                aria-describedby={isInvalid && errorMessage ? errorId : undefined}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border-1.5",
                  selected ? "border-primary" : "border-border-input",
                )}
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full bg-primary transition-transform duration-(--duration-instant) ease-out",
                    selected ? "scale-100" : "scale-0",
                  )}
                />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold leading-5 text-foreground">{option.title}</span>
                {option.description && (
                  <span className="text-xs leading-[18px] text-muted">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {isInvalid && errorMessage && (
        <p
          id={errorId}
          className="flex items-center gap-2 px-1 text-[13px] font-semibold text-secondary-600 before:size-[7px] before:shrink-0 before:rounded-full before:bg-accent before:content-['']"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
