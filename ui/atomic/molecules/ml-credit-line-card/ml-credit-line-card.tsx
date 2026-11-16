"use client";

import { cn } from "@heroui/react";

import { AtProgress } from "@/ui/atomic/atoms";

import { MlCreditLineCardProps } from "./ml-credit-line-card.types";

/**
 * "Línea de crédito" del total del pedido a crédito (Figma `3724:3013`) y "Línea de crédito bloqueada" (`3726:3051`):
 * barra del cupo comprometido, comprometido, disponible y cupo aprobado. Sin tope (`limitLabel` nulo) solo queda
 * "Comprometido" (hueco aceptado en T-06b). Los importes llegan formateados.
 */
export function MlCreditLineCard({
  companyName,
  committedLabel,
  availableLabel,
  limitLabel,
  usedRatio,
  isBlocked = false,
  note,
  className,
}: MlCreditLineCardProps) {
  const titulo = isBlocked ? "Línea de crédito bloqueada" : "Línea de crédito";
  const porcentaje = usedRatio === null ? null : Math.round(Math.min(1, Math.max(0, usedRatio)) * 100);
  const filas = [
    { label: "Comprometido", value: committedLabel, clase: "text-strength-medium-foreground" },
    availableLabel !== null && {
      label: "Disponible",
      value: isBlocked ? `${availableLabel} · bloqueado` : availableLabel,
      clase: isBlocked ? "text-secondary-700" : "text-brand",
    },
    limitLabel !== null && { label: "Cupo aprobado", value: limitLabel, clase: "text-primary" },
  ].filter((fila): fila is { label: string; value: string; clase: string } => Boolean(fila));

  return (
    <section
      aria-label={titulo}
      className={cn("flex flex-col gap-3 rounded-control px-4 py-3.5", isBlocked ? "bg-secondary-50" : "bg-surface-sand/45", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("text-xs font-semibold leading-4", isBlocked ? "text-secondary-700" : "text-foreground")}>{titulo}</p>
        {companyName && <p className="truncate text-[11px] leading-4 text-muted">{companyName}</p>}
      </div>
      {porcentaje !== null && (
        <AtProgress
          aria-label={`Cupo comprometido: ${porcentaje} %`}
          value={porcentaje}
          size="sm"
          classNames={{
            track: "h-2 bg-track",
            indicator: isBlocked ? "bg-accent" : "bg-strength-medium",
          }}
        />
      )}
      <dl className="flex flex-col gap-1.5 text-xs leading-5">
        {filas.map((fila) => (
          <div key={fila.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">{fila.label}</dt>
            <dd className={cn("font-semibold tabular-nums", fila.clase)}>{fila.value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="text-[11px] leading-4 text-muted">{note}</p>}
    </section>
  );
}
