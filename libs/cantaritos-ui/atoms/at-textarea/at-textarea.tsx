"use client";

import { Textarea } from "@heroui/react";

import { AtTextareaProps } from "./at-textarea.types";

export function AtTextarea({
  variant = "bordered",
  classNames,
  ...props
}: AtTextareaProps) {
  return (
    <Textarea
      variant={variant}
      classNames={{
        inputWrapper: "bg-white",
        ...classNames,
      }}
      {...props}
    />
  );
}
