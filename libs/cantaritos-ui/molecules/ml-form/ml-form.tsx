"use client";

import { Form } from "@heroui/form";

import { MlFormProps } from "./ml-form.types";

export function MlForm({
  validationBehavior = "native",
  className,
  ...props
}: MlFormProps) {
  return (
    <Form
      validationBehavior={validationBehavior}
      className={`flex flex-col gap-4 ${className ?? ""}`.trim()}
      {...props}
    />
  );
}
