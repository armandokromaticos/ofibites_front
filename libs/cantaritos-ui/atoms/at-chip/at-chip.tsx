"use client";

import { Chip } from "@heroui/react";

import { AtChipProps } from "./at-chip.types";

export function AtChip(props: AtChipProps) {
  return <Chip {...props} />;
}
