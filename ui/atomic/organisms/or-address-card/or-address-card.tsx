"use client";

import { cn } from "@heroui/react";

import { AtButton, AtChip } from "@/ui/atomic/atoms";

import { OrAddressCardProps } from "./or-address-card.types";

/**
 * Card de una sede en "Direcciones y sedes" (Figma `3657:2154`): nombre, badge "Sede principal" si aplica,
 * dirección completa y, si hay, la línea de referencia/contacto. "Editar"/"Eliminar" solo para quien puede
 * gestionar sedes (`canManage`, calculado por la página a partir del rol de la membresía activa); el resto
 * ve la card sin esos botones (lista de solo lectura).
 */
export function OrAddressCard({
  label,
  isPrimary = false,
  addressLine,
  referenceContactLine,
  canManage,
  onEdit,
  onDelete,
  className,
}: OrAddressCardProps) {
  return (
    <article className={cn("flex flex-col gap-2 rounded-card bg-content1 p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold leading-5 text-foreground">{label}</h3>
          {isPrimary && <AtChip>Sede principal</AtChip>}
        </div>
        {canManage && (
          <div className="flex items-center gap-1">
            <AtButton
              size="sm"
              variant="light"
              color="default"
              className="text-ghost-foreground"
              onPress={onEdit}
              aria-label={`Editar ${label}`}
            >
              Editar
            </AtButton>
            <AtButton
              size="sm"
              variant="light"
              color="danger"
              onPress={onDelete}
              aria-label={`Eliminar ${label}`}
            >
              Eliminar
            </AtButton>
          </div>
        )}
      </div>
      <p className="text-xs leading-[18px] text-subtle">{addressLine}</p>
      {referenceContactLine && <p className="text-[11px] leading-4 text-subtle">{referenceContactLine}</p>}
    </article>
  );
}
