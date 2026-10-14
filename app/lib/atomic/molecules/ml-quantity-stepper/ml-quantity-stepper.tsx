"use client";

import { KeyboardEvent } from "react";

import { cn } from "@heroui/react";
import { Minus, Plus } from "lucide-react";

import { AtButton } from "@/app/lib/atomic/atoms";

import { MlQuantityStepperProps } from "./ml-quantity-stepper.types";

const STEP_BUTTON = "text-primary data-[hover=true]:bg-background";
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

  const change = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
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
        {value}
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
