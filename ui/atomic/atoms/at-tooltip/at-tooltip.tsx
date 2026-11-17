"use client";

import { cn, Tooltip } from "@heroui/react";

import { duration, ease } from "@/shared/motion";

import { AtTooltipProps } from "./at-tooltip.types";

/**
 * Entra con fundido + 6 px desde el disparador (lado izquierdo, colocación `right`) y sale más rápido.
 * Con `MotionConfig reducedMotion="user"` el desplazamiento se anula y queda el fundido.
 */
const TOOLTIP_MOTION = {
  variants: {
    exit: { opacity: 0, x: -6, transition: { duration: duration.instant, ease: ease.in } },
    enter: { opacity: 1, x: 0, transition: { duration: duration.fast, ease: ease.out } },
  },
};

export function AtTooltip({
  content,
  isRedundant = true,
  placement = "right",
  offset = 14,
  // Retardo al abrir; react-aria abre sin espera el siguiente mientras uno sigue "caliente".
  delay = 300,
  closeDelay = 0,
  classNames,
  ...props
}: AtTooltipProps) {
  return (
    <Tooltip
      content={isRedundant ? <span aria-hidden="true">{content}</span> : content}
      placement={placement}
      offset={offset}
      delay={delay}
      closeDelay={closeDelay}
      motionProps={TOOLTIP_MOTION}
      classNames={{
        ...classNames,
        // `ofi-tooltip`: se oculta durante las transiciones de página (globals.css), donde quedaba atrapado en
        // la captura de la raíz, por debajo de la página que entra.
        base: cn("ofi-tooltip", classNames?.base),
        content: cn(
          "rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-none",
          classNames?.content,
        ),
      }}
      {...props}
    />
  );
}
