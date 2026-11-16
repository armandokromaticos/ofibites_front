import { CSSProperties } from "react";

import { cn } from "@heroui/react";
import { Check } from "lucide-react";

import { MlOrderTimelineProps } from "./ml-order-timeline.types";

/**
 * Línea de estados del pedido. Dos diseños según `orientation`:
 * - `responsive` (Figma 3465:3585, pedido confirmado): una barra por paso; los cumplidos en `brand`, el que está en
 *   curso en `accent` con su ayuda debajo y los pendientes en `surface-sand`. En pantallas estrechas va en columna.
 * - `vertical` (Figma 3632:1686 y 3567:1374, "Seguimiento" del detalle): marca en círculo de 22 px (cumplido: relleno
 *   `brand` con check blanco; en curso: anillo de 5 px `brand-caption`; pendiente: anillo de 1,5 px `step-idle`),
 *   etiqueta de 13 px y la ayuda de cada paso (si la trae) en 12 px `placeholder`.
 * El paso en curso lleva `aria-current="step"`; el estado de cada paso también va en texto para lectores de pantalla
 * (no solo en el color).
 */
export function MlOrderTimeline({
  steps,
  completedCount,
  label = "Estado del pedido",
  labelledBy,
  orientation = "responsive",
  className,
}: MlOrderTimelineProps) {
  const enFila = orientation === "responsive";
  const estadoSr = (isDone: boolean, isCurrent: boolean) => (
    <span className="sr-only">{isDone ? " (cumplido)" : isCurrent ? " (en curso)" : " (pendiente)"}</span>
  );

  if (!enFila) {
    return (
      <ol aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy} className={cn("flex flex-col gap-4", className)}>
        {steps.map((step, index) => {
          const isDone = index < completedCount;
          const isCurrent = index === completedCount;
          return (
            <li key={step.label} aria-current={isCurrent ? "step" : undefined} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full",
                  isDone && "bg-brand text-white",
                  isCurrent && "border-[5px] border-brand-caption bg-content1",
                  !isDone && !isCurrent && "border-[1.5px] border-step-idle bg-content1",
                )}
              >
                {isDone && <Check strokeWidth={3} className="size-3" />}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                <span className={cn("text-[13px] font-semibold leading-4", isDone || isCurrent ? "text-foreground" : "text-muted")}>
                  {step.label}
                  {estadoSr(isDone, isCurrent)}
                </span>
                {step.hint && <span className="text-xs leading-4 text-placeholder">{step.hint}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={cn("grid gap-3 sm:grid-cols-(--timeline-cols) sm:gap-1.5", className)}
      style={{ "--timeline-cols": `repeat(${steps.length}, minmax(0, 1fr))` } as CSSProperties}
    >
      {steps.map((step, index) => {
        const isDone = index < completedCount;
        const isCurrent = index === completedCount;
        return (
          <li key={step.label} aria-current={isCurrent ? "step" : undefined} className="flex gap-3 sm:flex-col sm:gap-2.5">
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
                {estadoSr(isDone, isCurrent)}
              </span>
              {isCurrent && step.hint && <span className="text-[11px] leading-4 text-muted">{step.hint}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
