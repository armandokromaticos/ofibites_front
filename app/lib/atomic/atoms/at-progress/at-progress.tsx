"use client";

import { cn, Progress } from "@heroui/react";

import { AtProgressProps } from "./at-progress.types";

export function AtProgress({ classNames, radius = "full", ...props }: AtProgressProps) {
  return (
    <Progress
      radius={radius}
      classNames={{
        ...classNames,
        track: cn("h-[10.5px] bg-track", classNames?.track),
        indicator: cn("bg-accent", classNames?.indicator),
        label: cn("text-sm font-semibold text-foreground", classNames?.label),
        value: cn("text-sm font-semibold text-foreground", classNames?.value),
      }}
      {...props}
    />
  );
}
