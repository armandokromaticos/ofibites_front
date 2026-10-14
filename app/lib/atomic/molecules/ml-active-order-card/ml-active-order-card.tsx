"use client";

import { useId } from "react";

import { cn } from "@heroui/react";
import { PackageOpen } from "lucide-react";

import { AtChip, AtProgress, AtSkeleton } from "@/app/lib/atomic/atoms";

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
        <AtProgress
          aria-label={`Avance del pedido: ${order.statusLabel}`}
          value={order.progress}
          classNames={{ track: "h-[11px]" }}
        />
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
      aria-labelledby={titleId}
      aria-busy={isLoading || undefined}
      className={cn("flex flex-col gap-5 rounded-card bg-content1 px-[15px] py-[14px]", className)}
    >
      <div className="flex items-center justify-between gap-3 pt-[5px]">
        <Heading id={titleId} className="text-base font-bold leading-[26px] text-foreground">
          {title}
        </Heading>
        {isLoading && <AtSkeleton className="h-[18px] w-20 rounded-full" />}
        {!isLoading && order && (
          <AtChip startContent={order.statusIcon} className="shrink-0">
            {order.statusLabel}
          </AtChip>
        )}
      </div>
      {body}
    </section>
  );
}
