import { CSSProperties } from "react";

import { cn } from "@heroui/react";

import { MlOrderTimelineProps } from "./ml-order-timeline.types";

/**
 * Línea de estados del pedido (Figma 3465:3585): una barra por paso; los cumplidos en `brand`, el que está en curso
 * en `accent` con su ayuda debajo y los pendientes en `surface-sand`. En pantallas estrechas va en columna, con la
 * barra a la izquierda. El paso en curso lleva `aria-current="step"`; el estado de cada paso también va en texto
 * para lectores de pantalla (no solo en el color).
 */
export function MlOrderTimeline({
  steps,
  completedCount,
  label = "Estado del pedido",
  className,
}: MlOrderTimelineProps) {
  return (
    <ol
      aria-label={label}
      className={cn("grid gap-3 sm:grid-cols-(--timeline-cols) sm:gap-1.5", className)}
      style={{ "--timeline-cols": `repeat(${steps.length}, minmax(0, 1fr))` } as CSSProperties}
    >
      {steps.map((step, index) => {
        const isDone = index < completedCount;
        const isCurrent = index === completedCount;
        return (
          <li
            key={step.label}
            aria-current={isCurrent ? "step" : undefined}
            className="flex gap-3 sm:flex-col sm:gap-2.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                "w-1 shrink-0 rounded-full sm:h-1 sm:w-full",
                isDone ? "bg-brand" : isCurrent ? "bg-accent" : "bg-surface-sand",
              )}
            />
            <span className="flex flex-col gap-1 py-0.5 sm:py-0">
              <span
                className={cn(
                  "text-xs leading-4",
                  isDone && "font-semibold text-brand",
                  isCurrent && "font-semibold text-secondary-600",
                  !isDone && !isCurrent && "text-muted",
                )}
              >
                {step.label}
                <span className="sr-only">
                  {isDone ? " (cumplido)" : isCurrent ? " (en curso)" : " (pendiente)"}
                </span>
              </span>
              {isCurrent && step.hint && <span className="text-[11px] leading-4 text-muted">{step.hint}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
