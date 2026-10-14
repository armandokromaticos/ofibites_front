"use client";

import { cn, Textarea } from "@heroui/react";

import { AtTextareaProps } from "./at-textarea.types";

type TextareaSlots = NonNullable<AtTextareaProps["classNames"]>;

// Mismo estilo base que AtInput (fondo, borde, foco) sin la altura fija; radio de control (12px).
const BASE_SLOTS: TextareaSlots = {
  inputWrapper: [
    "bg-background border-small border-border-input",
    "data-[hover=true]:border-border-input",
    "group-data-[focus=true]:border-primary",
    "group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-focus",
    // Error igual que AtInput: borde accent de 2 px (1 px + sombra interior) y texto AA en secondary-600.
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

function mergeSlots(...slotSets: (TextareaSlots | undefined)[]): TextareaSlots {
  const merged: Record<string, string> = {};
  for (const slots of slotSets) {
    if (!slots) continue;
    for (const [key, value] of Object.entries(slots)) {
      merged[key] = cn(merged[key], value) ?? "";
    }
  }
  return merged as TextareaSlots;
}

export function AtTextarea({
  variant = "bordered",
  radius = "md",
  classNames,
  ...props
}: AtTextareaProps) {
  return (
    <Textarea
      variant={variant}
      radius={radius}
      classNames={mergeSlots(BASE_SLOTS, classNames)}
      {...props}
    />
  );
}
