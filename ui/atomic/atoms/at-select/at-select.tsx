"use client";

import { cn, Select } from "@heroui/react";

import { AtSelectProps } from "./at-select.types";

/**
 * HeroUI fija en línea el ancho de la lista al del trigger, y las opciones largas se cortaban ("Progra…").
 * `minWidth: max-content` deja que la lista crezca hasta mostrar la opción completa sin quedar más estrecha que
 * el trigger (feedback de diseño T-35). Úsalo también en los `Select` de HeroUI que no pasan por `AtSelect`.
 */
export const SELECT_POPOVER_PROPS = { style: { minWidth: "max-content" } } as const;

export function AtSelect<T extends object = object>({
  variant = "bordered",
  radius = "full",
  classNames,
  ...props
}: AtSelectProps<T>) {
  return (
    <Select<T>
      variant={variant}
      radius={radius}
      popoverProps={SELECT_POPOVER_PROPS}
      classNames={{
        ...classNames,
        trigger: cn(
          "h-[57px] min-h-[57px] bg-background border-small border-border-input px-[18px]",
          "data-[hover=true]:border-border-input data-[open=true]:border-primary",
          "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-focus",
          "group-data-[invalid=true]:!border-accent group-data-[invalid=true]:border-2",
          classNames?.trigger,
        ),
        value: cn("text-base font-semibold !text-foreground", classNames?.value),
        selectorIcon: cn("size-5 text-foreground", classNames?.selectorIcon),
      }}
      {...props}
    />
  );
}
