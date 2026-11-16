"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";

import { cn } from "@heroui/react";
import { ClipboardList } from "lucide-react";

import { AtSkeleton } from "@/ui/atomic/atoms";
import { MlEmptyState, MlOrderRow } from "@/ui/atomic/molecules";

import { OrRecentOrdersProps } from "./or-recent-orders.types";

function OrderRowSkeleton() {
  return (
    <div className="flex flex-col gap-[13px]">
      <div className="flex items-start gap-2">
        <AtSkeleton className="size-[21px] shrink-0 rounded" />
        <div className="flex flex-1 flex-col gap-2.5">
          <AtSkeleton className="h-4 w-3/4 rounded-full" />
          <AtSkeleton className="h-3 w-full rounded-full" />
          <AtSkeleton className="h-3 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[11px]">
        <AtSkeleton className="h-[26px] rounded-full" />
        <AtSkeleton className="h-[26px] rounded-full" />
      </div>
    </div>
  );
}

/**
 * Card "Últimos pedidos" del Dashboard (Figma 3216:28339): título + "Ver todos" y una lista
 * de `MlOrderRow` separadas por divisores. Incluye carga y vacío.
 * "Ver todos" va en `secondary-600` y subrayado al pasar: el `accent` a 13 px no llega a AA.
 */
export function OrRecentOrders({
  orders,
  isLoading = false,
  title = "Últimos pedidos",
  headingLevel = 2,
  viewAllHref,
  onRepeat,
  repeatingOrderId,
  repeatError,
  skeletonRows = 3,
  emptyTitle = "Aún no hay pedidos",
  emptyDescription = "Aquí aparecerán para que los repitas en un clic.",
  emptyActionLabel = "Hacer mi primer pedido",
  emptyActionHref,
  className,
}: OrRecentOrdersProps) {
  const Heading = `h${headingLevel}` as const;
  const titleId = useId();
  const isEmpty = !isLoading && orders.length === 0;
  const errorRef = useRef<HTMLParagraphElement>(null);

  // "Repetir" queda inerte mientras carga y el foco se pierde: con un error, el foco pasa al mensaje.
  useEffect(() => {
    if (repeatError) errorRef.current?.focus();
  }, [repeatError]);

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={isLoading || undefined}
      className={cn("flex flex-col gap-1.5 rounded-card bg-content1 px-[15px] py-4", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <Heading id={titleId} className="text-base font-bold leading-[26px] text-foreground">
          {title}
        </Heading>
        {viewAllHref && !isLoading && !isEmpty && (
          <Link
            href={viewAllHref}
            aria-label="Ver todos los pedidos"
            className={cn(
              "rounded-sm px-1 text-[13px] leading-4 text-secondary-600 underline-offset-2 hover:underline",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            )}
          >
            Ver todos
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col divide-y divide-border-subtle">
          <span className="sr-only">Cargando tus últimos pedidos</span>
          {Array.from({ length: skeletonRows }, (_, index) => (
            <div key={index} className="py-3 first:pt-1.5 last:pb-0">
              <OrderRowSkeleton />
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <MlEmptyState
          size="sm"
          headingLevel={headingLevel === 2 ? 3 : 4}
          icon={<ClipboardList />}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionHref ? emptyActionLabel : undefined}
          actionHref={emptyActionHref}
        />
      )}

      {!isLoading && !isEmpty && (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {orders.map(({ id, ...order }) => (
            <li key={id} className="py-3 first:pt-1.5 last:pb-0">
              <MlOrderRow
                {...order}
                onRepeat={onRepeat ? () => onRepeat(id) : undefined}
                isRepeatLoading={repeatingOrderId === id}
              />
              {repeatError?.orderId === id && (
                <p
                  ref={errorRef}
                  role="alert"
                  tabIndex={-1}
                  className="mt-2 rounded-control bg-danger-50 px-3 py-2 text-xs leading-5 text-danger-700 outline-none"
                >
                  {repeatError.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
