import { Chip, cn } from "@heroui/react";

import { AtStatusChipProps, AtStatusChipTone } from "./at-status-chip.types";

/**
 * Colores de los chips de pago y estado del Figma (Pedidos realizados 3562:1180, detalle del pedido y comprobante),
 * todos en AA a 11 px: `brand` sobre `brand-tint` (Completado/Entregado), `secondary-600` sobre `secondary-100`
 * (Pendiente/Cancelado; el naranja `accent` del Figma solo llega a 3,4:1), `info-foreground` sobre `info-soft` (Recibido, ~6,5:1), `primary` sobre
 * arena (Programado) y sobre `primary-100` (En tránsito, sin Figma).
 */
const TONOS: Record<AtStatusChipTone, { base: string; dot: string }> = {
  success: { base: "bg-brand-tint text-brand", dot: "bg-brand" },
  warning: { base: "bg-surface-sand/70 text-strength-medium-foreground", dot: "bg-strength-medium" },
  danger: { base: "bg-secondary-100 text-secondary-600", dot: "bg-accent" },
  neutral: { base: "bg-track text-muted", dot: "bg-muted" },
  info: { base: "bg-info-soft text-info-foreground", dot: "bg-info-foreground" },
  sand: { base: "bg-surface-sand text-primary", dot: "bg-primary" },
  olive: { base: "bg-primary-100 text-primary", dot: "bg-primary" },
  /** "Inactivo" de Administración de usuarios (Figma 3463:2171): ~3,7:1, por debajo de AA (color pedido así). */
  inactive: { base: "bg-inactive/55 text-inactive-foreground", dot: "bg-inactive-foreground" },
};

const TONOS_OSCURO: Record<AtStatusChipTone, string> = {
  success: "bg-surface-cream text-brand",
  warning: "bg-surface-cream text-strength-medium-foreground",
  danger: "bg-secondary-50 text-secondary-700",
  neutral: "bg-track text-muted",
  info: "bg-info-soft text-info-foreground",
  sand: "bg-surface-sand text-primary",
  olive: "bg-primary-100 text-primary",
  inactive: "bg-surface-cream text-inactive-foreground",
};

/** Chip de estado de pago o de pedido (píldora 11 px semibold). El texto ya dice el estado: el color no es el único indicador. */
export function AtStatusChip({
  tone,
  children,
  hasDot = false,
  onDark = false,
  className,
}: AtStatusChipProps) {
  const estilo = TONOS[tone];
  return (
    <Chip
      size="sm"
      radius="full"
      startContent={hasDot ? <span aria-hidden="true" className={cn("ml-1 size-1.5 rounded-full", estilo.dot)} /> : undefined}
      classNames={{
        base: cn("h-[22px] px-2", onDark ? TONOS_OSCURO[tone] : estilo.base, className),
        content: "px-1 text-[11px] font-semibold leading-none",
      }}
    >
      {children}
    </Chip>
  );
}
