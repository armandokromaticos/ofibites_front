"use client";

import { Input } from "@heroui/input";

import { AtInputProps } from "./at-input.types";

export function AtInput({
  variant = "bordered",
  classNames,
  ...props
}: AtInputProps) {
  return (
    <Input
      variant={variant}
      classNames={{
        inputWrapper: "bg-white",
        ...classNames,
      }}
      {...props}
    />
  );
}
