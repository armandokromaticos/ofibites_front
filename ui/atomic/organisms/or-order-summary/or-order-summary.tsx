import Image from "next/image";

import { cn } from "@heroui/react";

import { OrOrderSummaryProps } from "./or-order-summary.types";

/**
 * Resumen lateral del pedido (Figma 3462:2094, 3465:2846 y 3465:3585): título, conteo, líneas con foto, cantidad y
 * subtotal, filas de importes y el total grande. Todos los importes llegan formateados: los calcula el servidor.
 * El pie (`children`) lleva las acciones de cada paso.
 */
export function OrOrderSummary({
  title = "Resumen del pedido",
  titleId,
  countLabel,
  subtitle,
  header,
  lines = [],
  rows,
  totalLabel,
  children,
  className,
}: OrOrderSummaryProps) {
  return (
    <aside aria-labelledby={titleId} className={cn("flex flex-col rounded-card bg-content1 p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-0.5 border-b border-divider pb-4">
        <h2 id={titleId} className="font-display text-xl font-bold leading-7 text-foreground">
          {title}
        </h2>
        {countLabel && <p className="text-xs leading-5 text-subtle">{countLabel}</p>}
        {subtitle && <p className="text-xs leading-5 text-brand">{subtitle}</p>}
      </div>

      {header && <div className="border-b border-divider py-4">{header}</div>}

      {lines.length > 0 && (
        <ul aria-label="Productos" className="flex flex-col gap-3.5 border-b border-divider py-4">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-3">
              <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-surface-sand">
                <Image src={line.imageSrc} alt="" fill sizes="36px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-semibold leading-[18px] text-foreground">{line.name}</span>
                <span className="text-[11px] leading-4 text-subtle">{line.detail}</span>
                {line.notice && (
                  <span className="text-[11px] font-semibold leading-4 text-danger-700">{line.notice}</span>
                )}
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">{line.subtotalLabel}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="flex flex-col gap-2 border-b border-divider py-4 text-[13px] leading-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-foreground">{row.label}</dt>
            <dd
              className={cn(
                "font-semibold tabular-nums",
                row.isHighlighted ? "text-secondary-600" : "text-foreground",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <dl className="flex items-baseline justify-between gap-4 pb-5 pt-4">
        <dt className="text-[15px] font-semibold text-foreground">Total</dt>
        <dd className="text-[26px] font-bold leading-8 tracking-[-0.01em] tabular-nums text-foreground">{totalLabel}</dd>
      </dl>

      {children && <div className="flex flex-col gap-3">{children}</div>}
    </aside>
  );
}
