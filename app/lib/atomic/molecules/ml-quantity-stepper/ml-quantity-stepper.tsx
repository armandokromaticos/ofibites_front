"use client";

import { KeyboardEvent, useState } from "react";

import { cn } from "@heroui/react";
import { Minus, Plus } from "lucide-react";

import { AtButton } from "@/app/lib/atomic/atoms";

import { MlQuantityStepperProps } from "./ml-quantity-stepper.types";

// Al pulsar, el botón se encoge más que el 0.97 de HeroUI (es pequeño y redondo).
const STEP_BUTTON =
  "text-primary data-[hover=true]:bg-background motion-safe:data-[pressed=true]:scale-[0.85]";
// En los extremos el botón sigue enfocable (aria-disabled): con `disabled` el foco caería a <body>.
const AT_LIMIT = "opacity-disabled cursor-not-allowed data-[hover=true]:bg-transparent";

export function MlQuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "cantidad",
  isDisabled = false,
  className,
}: MlQuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  // Último cambio hecho desde aquí ({ valor resultante, dirección }). Solo anima si el valor actual es ese:
  // un valor inicial o cambiado desde fuera no da "tick" (ni con una dirección vieja).
  const [tick, setTick] = useState<{ value: number; delta: number } | null>(null);
  const tickDelta = tick?.value === value ? tick.delta : 0;

  const change = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    setTick({ value: next, delta });
    onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      change(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      change(-1);
    }
  };

  return (
    <div
      role="group"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex h-[37px] w-full items-center justify-between rounded-full border-1 border-primary bg-content1 px-1",
        isDisabled && "opacity-disabled",
        className,
      )}
    >
      <AtButton
        isIconOnly
        size="sm"
        variant="light"
        color="default"
        className={cn(STEP_BUTTON, atMin && AT_LIMIT)}
        aria-label={`Disminuir ${label}`}
        aria-disabled={atMin || undefined}
        isDisabled={isDisabled}
        onPress={() => change(-1)}
      >
        <Minus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
      </AtButton>
      <output
        aria-live="polite"
        aria-atomic="true"
        className="min-w-8 text-center text-[15px] font-bold leading-5 text-primary tabular-nums"
      >
        <span className="sr-only">{`${label}: `}</span>
        {/* `key` reinicia la animación en cada cambio. */}
        <span
          key={value}
          className={cn(
            "inline-block",
            tickDelta > 0 && "ofi-tick-up",
            tickDelta < 0 && "ofi-tick-down",
          )}
        >
          {value}
        </span>
      </output>
      <AtButton
        isIconOnly
        size="sm"
        variant="light"
        color="default"
        className={cn(STEP_BUTTON, atMax && AT_LIMIT)}
        aria-label={`Aumentar ${label}`}
        aria-disabled={atMax || undefined}
        isDisabled={isDisabled}
        onPress={() => change(1)}
      >
        <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
      </AtButton>
    </div>
  );
}
