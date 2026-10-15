"use client";

import { Button, cn } from "@heroui/react";

import { AtButtonProps, AtButtonSize } from "./at-button.types";

// Escala del Figma. Se pasan como className a Button (no extendVariants: rompe `as`).
const SIZE_CLASSES: Record<AtButtonSize, string> = {
  xs: "h-[26px] min-w-0 px-3 text-[11px] gap-1.5",
  sm: "h-8 px-4 text-xs gap-2",
  md: "h-[37px] px-5 text-xs gap-2",
  lg: "h-[60px] px-8 text-base gap-3",
};

const ICON_ONLY_CLASSES: Record<AtButtonSize, string> = {
  xs: "w-[26px] min-w-[26px] px-0",
  sm: "w-8 min-w-8 px-0",
  md: "w-[37px] min-w-[37px] px-0",
  lg: "w-[60px] min-w-[60px] px-0",
};

/*
 * Hover del botón principal (entrega de diseño del dashboard): un relleno `brand` barre de izquierda a
 * derecha por debajo del texto, en lugar del fundido de opacidad de HeroUI. Con movimiento reducido, el
 * relleno aparece con fundido. La pulsación (escala 0.97) y el ripple ya los pone HeroUI.
 */
const PRIMARY_SWEEP = cn(
  "isolate data-[hover=true]:opacity-100",
  "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-brand before:content-['']",
  "before:-translate-x-[101%] data-[hover=true]:before:translate-x-0",
  "before:transition-transform before:duration-(--duration-base) before:ease-out",
  "motion-reduce:before:translate-x-0 motion-reduce:before:opacity-0 motion-reduce:data-[hover=true]:before:opacity-100",
  "motion-reduce:before:transition-opacity",
);

export function AtButton({
  color = "primary",
  radius = "full",
  size = "md",
  variant = "solid",
  isIconOnly,
  className,
  ...props
}: AtButtonProps) {
  // Un botón inerte (aria-disabled) no reacciona al hover.
  const ariaDisabled = props["aria-disabled"];
  const isAriaDisabled = ariaDisabled === true || ariaDisabled === "true";
  const hasSweep = color === "primary" && variant === "solid" && !isAriaDisabled;

  return (
    <Button
      color={color}
      radius={radius}
      size={size === "xs" ? "sm" : size}
      variant={variant}
      isIconOnly={isIconOnly}
      className={cn(
        "font-semibold",
        SIZE_CLASSES[size],
        isIconOnly && ICON_ONLY_CLASSES[size],
        hasSweep && PRIMARY_SWEEP,
        className,
      )}
      {...props}
    />
  );
}
