"use client";

import { useId, useRef } from "react";

import { cn } from "@heroui/react";
import { PackageOpen } from "lucide-react";

import { useLoopActive } from "@/shared/motion/hooks";
import { AtChip, AtProgress, AtSkeleton } from "@/ui/atomic/atoms";

import { MlActiveOrderCardProps } from "./ml-active-order-card.types";

function Dot() {
  return <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-current" />;
}

/**
 * Card "Pedido en curso" del Dashboard (Figma 3216:28319): título + chip de estado,
 * producto · boxes · hora de llegada y barra de avance. Sin pedido, un texto breve en lugar
 * de la barra (el CTA para pedir ya está en la card de saludo, justo encima).
 */
export function MlActiveOrderCard({
  order,
  isLoading = false,
  title = "Pedido en curso",
  headingLevel = 2,
  emptyMessage = "No tienes pedidos en curso. Cuando confirmes uno, aquí verás su estado y a qué hora llega.",
  className,
}: MlActiveOrderCardProps) {
  const Heading = `h${headingLevel}` as const;
  const titleId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const isLoopActive = useLoopActive(sectionRef);

  let body;
  if (isLoading) {
    body = (
      <div className="flex flex-col gap-2.5 pb-[5px]">
        <span className="sr-only">Cargando el pedido en curso</span>
        <AtSkeleton className="h-3 w-4/5 rounded-full" />
        <AtSkeleton className="h-[11px] w-full rounded-full" />
      </div>
    );
  } else if (order) {
    body = (
      <div className="flex flex-col gap-1.5 pb-[5px]">
        <p className="flex flex-wrap items-center gap-x-1 px-1.5 text-[11px] font-medium leading-[13px] text-subtle">
          <span>{order.productName}</span>
          <Dot />
          <span>{order.quantityLabel}</span>
          <Dot />
          <span>{order.etaLabel}</span>
        </p>
        <div className="flex flex-col">
          <AtProgress
            aria-label={`Avance del pedido: ${order.statusLabel}`}
            value={order.progress}
            fillOnMount
            isLive={order.progress > 0 && order.progress < 100}
            classNames={{ track: "h-[11px]" }}
          />
          {order.steps && order.steps.length > 0 && (
            // Se despliega con grid-template-rows 0fr → 1fr (sin max-height). Plegado sigue en el árbol
            // accesible: el lector de pantalla lee los pasos aunque no se vean.
            <div
              className={cn(
                "grid grid-rows-[0fr] group-hover/live:grid-rows-[1fr] group-focus-within/live:grid-rows-[1fr]",
                "motion-safe:transition-[grid-template-rows] motion-safe:duration-(--duration-base) motion-safe:ease-out",
              )}
            >
              <ol
                aria-label="Pasos del pedido"
                className={cn(
                  "flex min-h-0 justify-between gap-1 overflow-hidden px-0.5 text-[10px] leading-4 text-subtle",
                  "opacity-0 transition-opacity duration-(--duration-fast) ease-out",
                  "group-hover/live:opacity-100 group-focus-within/live:opacity-100",
                )}
              >
                {order.steps.map((step) => (
                  <li key={step.label} className={cn("pt-1.5", step.isDone && "font-semibold text-brand")}>
                    {step.label}
                    {step.isDone && <span className="sr-only"> (hecho)</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    body = (
      <p className="flex items-start gap-2.5 pb-[5px] text-[13px] leading-5 text-muted">
        <PackageOpen aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
        {emptyMessage}
      </p>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby={titleId}
      aria-busy={isLoading || undefined}
      className={cn(
        "group/live flex flex-col gap-5 rounded-card bg-content1 px-[15px] py-[14px]",
        // Panel de estado: al pasar, solo una sombra suave (no se desplaza).
        "transition-shadow duration-(--duration-base) ease-out hover:shadow-lift-card focus-within:shadow-lift-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 pt-[5px]">
        <Heading id={titleId} className="text-base font-bold leading-[26px] text-foreground">
          {title}
        </Heading>
        {isLoading && <AtSkeleton className="h-[18px] w-20 rounded-full" />}
        {!isLoading && order && (
          <AtChip
            startContent={
              order.statusIcon && (
                <span className={cn("inline-flex", order.isInTransit && isLoopActive && "ofi-bob")}>
                  {order.statusIcon}
                </span>
              )
            }
            className="shrink-0"
          >
            {order.statusLabel}
          </AtChip>
        )}
      </div>
      {body}
    </section>
  );
}
