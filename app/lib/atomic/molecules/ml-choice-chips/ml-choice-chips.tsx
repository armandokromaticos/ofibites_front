"use client";

import { useId } from "react";

import { cn } from "@heroui/react";
import { Check } from "lucide-react";

import { MlChoiceChipsProps } from "./ml-choice-chips.types";

/** Clases estáticas para que Tailwind las emita. */
const COLUMN_CLASSES = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
} as const;

/**
 * Chips píldora de elección (Figma 3244:12471, "¿Cuántos empleados tiene la empresa?").
 * - `selectionMode="single"` (por defecto): radios nativos; flechas para moverse y espacio para elegir.
 * - `selectionMode="multiple"`: casillas nativas; el chip elegido lleva un check, para que se
 *   distinga de la elección única también sin color.
 * Foco visible en el chip en ambos casos.
 */
export function MlChoiceChips(props: MlChoiceChipsProps) {
  const {
    name,
    label,
    description,
    options,
    columns = 5,
    isInvalid,
    errorMessage,
    isDisabled,
    className,
  } = props;
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const isMultiple = props.selectionMode === "multiple";

  const isSelected = (value: string) =>
    props.selectionMode === "multiple" ? props.value.includes(value) : props.value === value;

  const toggle = (value: string) => {
    if (props.selectionMode === "multiple") {
      const next = new Set(props.value);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      props.onChange(options.map((option) => option.value).filter((item) => next.has(item)));
      return;
    }
    props.onChange(value);
  };

  const describedBy =
    [description ? descriptionId : null, isInvalid && errorMessage ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      role={isMultiple ? "group" : "radiogroup"}
      aria-labelledby={labelId}
      // ARIA no admite aria-invalid en role="group" (sí en radiogroup); además va en cada input.
      aria-invalid={(!isMultiple && isInvalid) || undefined}
      aria-describedby={describedBy}
      className={cn("flex flex-col gap-[15px]", className)}
    >
      <div className="flex flex-col gap-1">
        <p id={labelId} className="text-[17px] font-semibold leading-[21px] text-primary">
          {label}
        </p>
        {description && (
          <p id={descriptionId} className="text-xs font-semibold leading-4 text-placeholder">
            {description}
          </p>
        )}
      </div>
      <div className={cn("grid grid-cols-2 gap-2.5", COLUMN_CLASSES[columns])}>
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex min-h-[57px] cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-1.5",
                "text-center text-sm font-semibold leading-[18px] transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus has-[:focus-visible]:ring-offset-2",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border-input text-primary hover:bg-surface-sand/50",
                isDisabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={name}
                value={option.value}
                checked={selected}
                disabled={isDisabled}
                onChange={() => toggle(option.value)}
                // En cada control, para que la descripción y el error se lean al recibir el foco.
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                className="sr-only"
              />
              {isMultiple && selected && (
                <Check aria-hidden="true" className="size-4 shrink-0" strokeWidth={3} />
              )}
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
