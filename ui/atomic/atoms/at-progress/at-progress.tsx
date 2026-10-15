"use client";

import { useRef } from "react";

import { cn, Progress } from "@heroui/react";

import { useLoopActive } from "@/shared/motion/hooks";

import { AtProgressProps } from "./at-progress.types";

export function AtProgress({
  classNames,
  radius = "full",
  fillOnMount = false,
  isLive = false,
  ...props
}: AtProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  // El brillo es un bucle: solo mientras la barra se ve y sin movimiento reducido.
  const isShining = useLoopActive(ref) && isLive && !props.isIndeterminate;

  return (
    <Progress
      ref={ref}
      radius={radius}
      classNames={{
        ...classNames,
        track: cn("h-[10.5px] bg-track", classNames?.track),
        // Los cambios de valor ya los anima HeroUI (transform, 500 ms). Al montar, la barra se llena
        // desde 0 hasta su valor; con `isLive`, un brillo la recorre (por encima del relleno).
        // `relative` solo con el brillo: en `isIndeterminate` el indicador de HeroUI es `absolute` y
        // tailwind-merge lo descartaría.
        indicator: cn(
          "bg-accent",
          fillOnMount && !props.isIndeterminate && "ofi-progress-fill",
          isShining && "ofi-shine relative overflow-hidden",
          classNames?.indicator,
        ),
        label: cn("text-sm font-semibold text-foreground", classNames?.label),
        value: cn("text-sm font-semibold text-foreground", classNames?.value),
      }}
      {...props}
    />
  );
}
