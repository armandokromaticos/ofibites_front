"use client";

import { cn, Slider } from "@heroui/react";

import { AtSliderProps } from "./at-slider.types";

/**
 * Slider del sitio (Figma `3702:2613`, zoom de la foto): pista `track`, relleno `primary` y pulgar blanco con borde
 * `primary`. Por defecto `size="sm"` y `color="primary"`.
 */
export function AtSlider({ classNames, size = "sm", color = "primary", ...props }: AtSliderProps) {
  return (
    <Slider
      size={size}
      color={color}
      classNames={{
        ...classNames,
        track: cn("bg-track", classNames?.track),
        thumb: cn("border-2 border-primary bg-content1 after:bg-content1 after:shadow-none", classNames?.thumb),
      }}
      {...props}
    />
  );
}
