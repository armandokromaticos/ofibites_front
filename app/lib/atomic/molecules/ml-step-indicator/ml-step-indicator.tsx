import { cn } from "@heroui/react";
import { Check } from "lucide-react";

import { MlStepIndicatorProps } from "./ml-step-indicator.types";

/**
 * Indicador de pasos del Figma (3244:12471): círculos de 47 px unidos por una pista de 6 px
 * que se rellena en `accent` hasta el paso actual. Los nombres de los pasos y "Paso N de M"
 * solo existen para lectores de pantalla; el paso actual lleva `aria-current="step"`.
 *
 * Diferencia con el Figma (AA): los pasos completados muestran un check y no el número, porque
 * el número blanco de 15 px sobre `accent` da 4,0:1. El paso actual
 * es blanco (no `step-idle`) con el número en `secondary-600`.
 */
export function MlStepIndicator({
  steps,
  currentStep,
  label = "Progreso",
  className,
}: MlStepIndicatorProps) {
  const total = steps.length;
  const progress = total > 1 ? (Math.min(currentStep, total - 1) / (total - 1)) * 100 : 0;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Pista: de centro a centro de los círculos de los extremos. */}
      <div aria-hidden="true" className="absolute inset-x-[23.5px] top-1/2 h-1.5 -translate-y-1/2 bg-divider">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol
        aria-label={`${label}: paso ${Math.min(currentStep + 1, total)} de ${total}`}
        className="relative flex items-center justify-between"
      >
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={step} aria-current={isCurrent ? "step" : undefined}>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-[47px] items-center justify-center rounded-full text-[15px] font-semibold",
                  isDone && "bg-accent text-primary-foreground",
                  // Figma: fondo step-idle; sobre blanco el número secondary-600 llega a AA (~5,7:1 frente a ~3,9:1).
                  isCurrent && "border-2 border-accent bg-content1 text-secondary-600",
                  !isDone && !isCurrent && "bg-step-idle text-foreground",
                )}
              >
                {isDone ? <Check className="size-5" strokeWidth={3} /> : index + 1}
              </span>
              <span className="sr-only">
                {`Paso ${index + 1}: ${step}`}
                {isDone && " (completado)"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
