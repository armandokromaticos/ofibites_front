import { cn } from "@heroui/react";

import { MlPopoverHeaderProps } from "./ml-popover-header.types";

/**
 * Cabecera de un popover de la top bar: título (Inter Bold 15) y una acción con aspecto de enlace a la derecha.
 * La acción va en `secondary-600` (el naranja `accent` no llega a AA en 13 px) con subrayado que crece al pasar
 * el ratón o con el foco.
 */
export function MlPopoverHeader({ title, titleId, action, actionRef, className }: MlPopoverHeaderProps) {
  return (
    <div className={cn("mb-2.5 flex min-h-6 items-center justify-between gap-3", className)}>
      <h2 id={titleId} tabIndex={-1} className="text-[15px] font-bold leading-6 text-foreground outline-none">
        {title}
      </h2>
      {action && (
        <button
          ref={actionRef}
          type="button"
          onClick={action.onPress}
          disabled={action.isDisabled}
          aria-label={action["aria-label"]}
          className={cn(
            "relative shrink-0 rounded-sm text-[13px] font-medium text-secondary-600",
            "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current",
            "after:transition-[scale] after:duration-(--duration-fast) after:ease-out",
            "hover:after:scale-x-100 focus-visible:after:scale-x-100",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:after:scale-x-0",
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
