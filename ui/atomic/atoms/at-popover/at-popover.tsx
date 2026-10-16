"use client";

import { cn, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

import { popoverMotionProps } from "@/shared/motion";

import { AtPopoverProps } from "./at-popover.types";

export function AtPopover({
  trigger,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  panelId,
  panelClassName,
  classNames,
  ...props
}: AtPopoverProps) {
  return (
    <Popover
      placement="bottom-end"
      offset={10}
      // Margen con el borde de la pantalla: en móvil el panel se desplaza para caber con 16 px a cada lado.
      containerPadding={16}
      motionProps={popoverMotionProps}
      classNames={{
        ...classNames,
        content: cn(
          // En móvil ocupa el ancho menos 16 px por lado; desde `sm`, 320 px como en el diseño.
          "w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] sm:w-80",
          "flex flex-col items-stretch justify-start gap-0 p-4",
          "rounded-[18px] border-1 border-border-subtle bg-content1 text-foreground shadow-popover",
          "outline-none",
          panelClassName,
          classNames?.content,
        ),
      }}
      {...props}
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent id={panelId} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
        {children}
      </PopoverContent>
    </Popover>
  );
}
