"use client";

import { Button } from "@heroui/button";

import { AtButtonProps } from "./at-button.types";

export function AtButton({
  color = "primary",
  ...props
}: AtButtonProps) {
  return (
    <Button
      color={color}
      {...props}
    />
  );
}
