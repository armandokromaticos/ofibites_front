import { cn } from "@heroui/react";

import { MlBarChartProps } from "./ml-bar-chart.types";

const MIN_BAR_HEIGHT_PERCENT = 6;

/**
 * Gráfico de barras simple (Figma "Pedidos por día" `3706:2856`): sin librería de gráficos en el repo, así
 * que son `div`s con altura proporcional al máximo de la serie. El valor exacto va en `title` (tooltip nativo)
 * y la serie completa en `aria-label` del contenedor, para quien no vea las barras.
 */
export function MlBarChart({ points, highlightKey, ariaLabel, className }: MlBarChartProps) {
  const max = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className={cn("flex h-40 items-end gap-1", className)} role="img" aria-label={ariaLabel}>
      {points.map((point) => {
        const isHighlighted = point.key === highlightKey;
        const heightPercent = Math.max(MIN_BAR_HEIGHT_PERCENT, (point.value / max) * 100);
        return (
          <div key={point.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <div
              title={`${point.label}: ${point.value} pedido${point.value === 1 ? "" : "s"}`}
              style={{ height: `${heightPercent}%` }}
              className={cn(
                "w-full min-w-[3px] rounded-t-sm transition-[height] duration-(--duration-base) ease-out",
                isHighlighted ? "bg-accent" : "bg-brand-soft",
              )}
            />
            <span className="text-[10px] font-medium leading-none text-subtle">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
