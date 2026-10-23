import { cn } from "@heroui/react";

import { AtTextLink } from "@/ui/atomic/atoms";

import { MlKpiCardProps } from "./ml-kpi-card.types";

const TONE_CLASSES: Record<NonNullable<MlKpiCardProps["subtitleTone"]>, string> = {
  default: "text-subtle",
  success: "text-green-700",
  danger: "text-danger-700",
};

/**
 * Tarjeta de KPI de "Indicadores" (Figma `3706:2856`): título Inter Semibold, valor Playfair Black 28px y
 * un subtítulo opcional (con color según el signo, p. ej. "+18% vs. agosto"). Puro por props: la pantalla
 * decide los valores y el formato.
 */
export function MlKpiCard({ title, value, subtitle, subtitleTone = "default", link, className }: MlKpiCardProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 rounded-card bg-content1 p-5", className)}>
      <span className="text-xs font-semibold leading-4 text-muted">{title}</span>
      <span className="font-display text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-foreground tabular-nums">
        {value}
      </span>
      {subtitle && <span className={cn("text-[11px] font-medium leading-4", TONE_CLASSES[subtitleTone])}>{subtitle}</span>}
      {link && (
        <AtTextLink href={link.href} className="text-[11px] font-semibold leading-4 text-primary">
          {link.label}
        </AtTextLink>
      )}
    </div>
  );
}
