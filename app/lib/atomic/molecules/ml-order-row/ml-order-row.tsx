"use client";

import { useId } from "react";
import Link from "next/link";

import { cn } from "@heroui/react";
import { Coffee } from "lucide-react";

import { AtButton, AtChip } from "@/app/lib/atomic/atoms";

import { MlOrderRowProps } from "./ml-order-row.types";

function Dot() {
  return <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-current" />;
}

/**
 * Fila de "Últimas ordenes" (Figma 3216:28344): icono, producto · boxes, chip de estado,
 * dirección, nº y fecha, y las acciones "Repetir" / "Ver detalle".
 * Los botones llevan el número en el nombre accesible para distinguirse entre filas.
 */
export function MlOrderRow({
  productName,
  quantityLabel,
  statusLabel,
  statusIcon,
  address,
  orderNumber,
  dateLabel,
  dateTime,
  onRepeat,
  isRepeatLoading,
  detailHref,
  onDetail,
  className,
}: MlOrderRowProps) {
  const orderRef = `pedido #${orderNumber}`;
  const unavailableId = useId();
  const isRepeatUnavailable = !onRepeat;

  return (
    <div className={cn("flex flex-col gap-[13px]", className)}>
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className="mt-px flex size-[21px] shrink-0 items-center justify-center rounded bg-brand-soft text-brand"
        >
          <Coffee className="size-3" strokeWidth={2.25} />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex items-start justify-between gap-1.5">
            <p className="flex flex-wrap items-center gap-x-1 text-sm font-medium leading-[17px] text-foreground">
              <span>{productName}</span>
              <Dot />
              <span>{quantityLabel}</span>
            </p>
            {/* 10 px: el mínimo legible (el Figma usa 8) y deja el título en una línea a 288 px. */}
            <AtChip startContent={statusIcon} className="shrink-0 px-1" classNames={{ content: "text-[10px]" }}>
              {statusLabel}
            </AtChip>
          </div>
          <div className="flex flex-col gap-1 text-[11px] leading-[13px] text-subtle">
            <p>{address}</p>
            <p className="flex items-center gap-1">
              <span>#{orderNumber}</span>
              <Dot />
              <time dateTime={dateTime}>{dateLabel}</time>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[11px]">
        {/* Sin `onRepeat`: enfocable pero inerte (aria-disabled, no `disabled`), con el motivo para lectores de pantalla. */}
        <AtButton
          size="xs"
          fullWidth
          onPress={isRepeatUnavailable ? undefined : onRepeat}
          isLoading={isRepeatLoading}
          aria-label={`Repetir ${orderRef}`}
          aria-disabled={isRepeatUnavailable || undefined}
          aria-describedby={isRepeatUnavailable ? unavailableId : undefined}
          className={cn(isRepeatUnavailable && "cursor-not-allowed opacity-disabled data-[hover=true]:opacity-disabled")}
        >
          Repetir
        </AtButton>
        {isRepeatUnavailable && (
          <span id={unavailableId} className="sr-only">
            Disponible próximamente
          </span>
        )}
        {detailHref ? (
          <AtButton
            as={Link}
            href={detailHref}
            size="xs"
            fullWidth
            variant="light"
            color="default"
            className="text-ghost-foreground"
            aria-label={`Ver detalle del ${orderRef}`}
          >
            Ver detalle
          </AtButton>
        ) : (
          <AtButton
            size="xs"
            fullWidth
            variant="light"
            color="default"
            className="text-ghost-foreground"
            onPress={onDetail}
            aria-label={`Ver detalle del ${orderRef}`}
          >
            Ver detalle
          </AtButton>
        )}
      </div>
    </div>
  );
}
