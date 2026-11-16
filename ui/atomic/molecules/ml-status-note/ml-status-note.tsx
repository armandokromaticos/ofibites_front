import { cn } from "@heroui/react";

import { MlStatusNoteProps, MlStatusNoteTone } from "./ml-status-note.types";

const TONOS: Record<MlStatusNoteTone, { caja: string; punto: string; titulo: string }> = {
  success: { caja: "bg-brand-tint", punto: "bg-brand", titulo: "text-brand" },
  warning: { caja: "bg-surface-sand/50", punto: "bg-strength-medium", titulo: "text-strength-medium-foreground" },
  // `secondary-700` sobre `secondary-100` da ~7:1 (AA).
  danger: { caja: "bg-secondary-100", punto: "bg-accent", titulo: "text-secondary-700" },
  neutral: { caja: "bg-background", punto: "bg-muted", titulo: "text-foreground" },
};

/**
 * Nota de estado con punto (Figma: "Pago completado / Validado por Finanzas…" en el total del pedido, y las notas
 * "Finanzas responde en máximo 1 día hábil…" de los modales). Radio 12, fondo tintado según el tono y el título en un
 * tono oscuro que llega a AA. No se anuncia: es estado, no alerta.
 */
export function MlStatusNote({ tone, title, children, id, className }: MlStatusNoteProps) {
  const estilo = TONOS[tone];
  return (
    <div id={id} className={cn("flex items-start gap-3 rounded-control px-4 py-3", estilo.caja, className)}>
      <span aria-hidden="true" className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", estilo.punto)} />
      <div className="flex min-w-0 flex-col gap-0.5">
        {title && <p className={cn("text-[13px] font-semibold leading-5", estilo.titulo)}>{title}</p>}
        {children && <div className="text-xs leading-[18px] text-foreground">{children}</div>}
      </div>
    </div>
  );
}
