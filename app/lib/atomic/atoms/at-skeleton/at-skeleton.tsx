"use client";

import { cn, Skeleton } from "@heroui/react";

import { AtSkeletonProps } from "./at-skeleton.types";

/** Pulso sobre `track` (el gris por defecto de HeroUI se pierde en el fondo crema). */
export function AtSkeleton({ className, ...props }: AtSkeletonProps) {
  return (
    <Skeleton
      aria-hidden="true"
      className={cn("rounded-control bg-track before:via-content1/60", className)}
      {...props}
    />
  );
}
