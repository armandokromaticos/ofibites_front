"use client";

import { useId } from "react";

import { cn } from "@heroui/react";

import { MlChoiceChipsProps } from "./ml-choice-chips.types";

/**
 * Elección única en chips píldora (Figma 3244:12471, "¿Cuántos empleados tiene la empresa?").
 * Son radios nativos: flechas para moverse, espacio para elegir y foco visible en el chip.
 */
export function MlChoiceChips({
  name,
  label,
  options,
  value,
  onChange,
  isInvalid,
  errorMessage,
  isDisabled,
  className,
}: MlChoiceChipsProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-invalid={isInvalid || undefined}
      aria-describedby={isInvalid && errorMessage ? errorId : undefined}
      className={cn("flex flex-col gap-[15px]", className)}
    >
      <p id={labelId} className="text-[17px] font-semibold leading-[21px] text-primary">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex h-[57px] cursor-pointer items-center justify-center rounded-full border px-2",
                "text-center text-sm font-semibold transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus has-[:focus-visible]:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border-input text-primary hover:bg-surface-sand/50",
                isDisabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {isInvalid && errorMessage && (
        <p
          id={errorId}
          className="flex items-center gap-2 px-[18px] text-[13px] font-semibold text-secondary-600 before:size-[7px] before:shrink-0 before:rounded-full before:bg-accent before:content-['']"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
