"use client";

import { cn, Input } from "@heroui/react";

import { AtInputProps } from "./at-input.types";

type InputSlots = NonNullable<AtInputProps["classNames"]>;

// Estilo base del Figma: píldora, fondo crema, borde border-input y foco visible (ring).
const BASE_SLOTS: InputSlots = {
  inputWrapper: [
    "bg-background border-small border-border-input",
    "data-[hover=true]:border-border-input",
    "group-data-[focus=true]:border-primary",
    "group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-focus",
  ].join(" "),
  input: "text-foreground placeholder:text-placeholder",
};

// Dimensiones del Figma (h57, Inter semibold 16, padding-x 18) en el tamaño por defecto.
// Solo `h-*` (sin min-h) para que un `h-*` del caller lo pueda sustituir.
// `size="sm"` conserva la altura compacta de HeroUI para filas de formulario.
const FIGMA_SIZE_SLOTS: InputSlots = {
  inputWrapper: "h-[57px] px-[18px]",
  input: "text-base font-semibold",
};

function mergeSlots(...slotSets: (InputSlots | undefined)[]): InputSlots {
  const merged: Record<string, string> = {};
  for (const slots of slotSets) {
    if (!slots) continue;
    for (const [key, value] of Object.entries(slots)) {
      merged[key] = cn(merged[key], value) ?? "";
    }
  }
  return merged as InputSlots;
}

export function AtInput({
  variant = "bordered",
  radius = "full",
  size = "md",
  classNames,
  ...props
}: AtInputProps) {
  return (
    <Input
      variant={variant}
      radius={radius}
      size={size}
      classNames={mergeSlots(
        BASE_SLOTS,
        size === "sm" ? undefined : FIGMA_SIZE_SLOTS,
        classNames,
      )}
      {...props}
    />
  );
}
