"use client";

import { Checkbox, cn } from "@heroui/react";

import { AtCheckboxProps } from "./at-checkbox.types";

export function AtCheckbox({ color = "primary", classNames, ...props }: AtCheckboxProps) {
  return (
    <Checkbox
      color={color}
      radius="sm"
      classNames={{
        ...classNames,
        base: cn("m-0 max-w-full items-start gap-1 p-0", classNames?.base),
        wrapper: cn(
          "mt-px size-5 rounded-[6px] before:rounded-[6px] after:rounded-[6px] before:border-border-input",
          "group-data-[invalid=true]:before:!border-accent",
          classNames?.wrapper,
        ),
        label: cn("text-[13px] font-semibold leading-[18px] text-primary", classNames?.label),
      }}
      {...props}
    />
  );
}
