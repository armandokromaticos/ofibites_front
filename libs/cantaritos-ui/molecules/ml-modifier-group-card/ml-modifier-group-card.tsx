"use client";

import { Pencil, Unlink } from "lucide-react";

import { AtButton } from "@/libs/cantaritos-ui/atoms";
import { Modifier } from "@/domain/types";

import { MlModifierGroupCardProps } from "./ml-modifier-group-card.types";

export function MlModifierGroupCard({
  group,
  onEdit,
  onRemove,
}: MlModifierGroupCardProps) {
  const selectType = group.maxSelect === 1 ? "Selección única" : "Multi-selección";
  const requiredLabel = group.isRequired ? "Requerido" : "Opcional";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col">
          <span className="font-semibold">{group.name}</span>
          <span className="text-xs text-gray-500">
            {requiredLabel} · {selectType} · {group.modifiers.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AtButton
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => onEdit(group)}
            aria-label="Editar grupo"
          >
            <Pencil className="h-4 w-4" />
          </AtButton>
          {onRemove && (
            <AtButton
              isIconOnly
              variant="light"
              size="sm"
              color="danger"
              onPress={() => onRemove(group)}
              aria-label="Desvincular grupo"
            >
              <Unlink className="h-4 w-4" />
            </AtButton>
          )}
        </div>
      </div>

      {/* Modifiers list */}
      {group.modifiers.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-4 text-sm text-gray-600">
          {group.modifiers.map((mod: Modifier) => (
            <div key={mod.id} className="flex justify-between">
              <span>{mod.name}</span>
              <span>
                {mod.priceAdjustment > 0
                  ? `+$${mod.priceAdjustment.toFixed(2)}`
                  : mod.priceAdjustment < 0
                    ? `-$${Math.abs(mod.priceAdjustment).toFixed(2)}`
                    : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-sm italic text-gray-500">
          Sin modificadores configurados
        </div>
      )}
    </div>
  );
}
