"use client";

import { cn, Select } from "@heroui/react";

import { AtSelectProps } from "./at-select.types";

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
