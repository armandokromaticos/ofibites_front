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

export function AtButton({
  color = "primary",
  radius = "full",
  size = "md",
  isIconOnly,
  className,
  ...props
}: AtButtonProps) {
  return (
    <Button
      color={color}
      radius={radius}
      size={size === "xs" ? "sm" : size}
      isIconOnly={isIconOnly}
      className={cn(
        "font-semibold",
        SIZE_CLASSES[size],
        isIconOnly && ICON_ONLY_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
