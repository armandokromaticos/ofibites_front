"use client";

import { Chip, cn } from "@heroui/react";

import { AtChipProps } from "./at-chip.types";

// Badge del Figma (sin `color`): fondo surface-sand, texto brand, 11px (mínimo accesible, no 8px).
const BADGE_SLOTS = {
  base: "bg-surface-sand text-brand h-[18px] px-1.5",
  content: "text-[11px] leading-none",
};

export function AtChip({
  radius = "full",
  size = "sm",
  color,
  classNames,
  ...props
}: AtChipProps) {
  const isBadge = color === undefined;

  return (
    <Chip
      radius={radius}
      size={size}
      color={color}
      classNames={
        isBadge
          ? {
              ...classNames,
              base: cn(BADGE_SLOTS.base, classNames?.base),
              content: cn(BADGE_SLOTS.content, classNames?.content),
            }
          : classNames
      }
      {...props}
    />
  );
}
