"use client";

import { cn, Input } from "@heroui/react";

import { AtInputProps } from "./at-input.types";

type InputSlots = NonNullable<AtInputProps["classNames"]>;

// Estilo base del Figma: píldora, fondo crema, borde border-input y foco visible (ring).
// Error (Figma 3388:2250): borde accent de 2 px y mensaje con punto. El texto de error va en
// secondary-600 (#BD3800): el accent (#E64400) sobre crema da ~3,5:1 y no llega a AA en 11-13 px.
const BASE_SLOTS: InputSlots = {
  inputWrapper: [
    "bg-background border-small border-border-input",
    "data-[hover=true]:border-border-input",
    "group-data-[focus=true]:border-primary",
    "group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-focus",
    // 2 px sin cambiar el ancho del borde (no salta 1 px): borde de 1 px + 1 px de sombra interior.
    "group-data-[invalid=true]:!border-accent group-data-[invalid=true]:shadow-[inset_0_0_0_1px_var(--color-accent)]",
  ].join(" "),
  input: [
    "text-foreground placeholder:text-placeholder",
    "group-data-[invalid=true]:!text-foreground group-data-[invalid=true]:placeholder:!text-placeholder",
  ].join(" "),
  label: "group-data-[invalid=true]:!text-secondary-600",
  errorMessage: [
    "flex items-center gap-2 text-[13px] font-semibold text-secondary-600",
    "before:size-[7px] before:shrink-0 before:rounded-full before:bg-accent before:content-['']",
  ].join(" "),
};

// Dimensiones del Figma (h57, Inter semibold 16, padding-x 18) en el tamaño por defecto.
// Solo `h-*` (sin min-h) para que un `h-*` del caller lo pueda sustituir.
// `size="sm"` conserva la altura compacta de HeroUI para filas de formulario.
const FIGMA_SIZE_SLOTS: InputSlots = {
  inputWrapper: "h-[57px] px-[18px]",
  // Alineado con el texto del input; con size="sm" (celdas estrechas, ml-size-row) no se aplica.
  helperWrapper: "px-[18px]",
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
