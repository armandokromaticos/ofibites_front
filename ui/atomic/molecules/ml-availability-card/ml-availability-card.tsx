"use client";

import { Card, CardBody } from "@heroui/react";

import { AtSwitch } from "@/ui/atomic/atoms";

import { MlAvailabilityCardProps } from "./ml-availability-card.types";

function SwitchRow({
  label,
  description,
  isSelected,
  onValueChange,
}: {
  label: string;
  description: string;
  isSelected: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <AtSwitch isSelected={isSelected} onValueChange={onValueChange} aria-label={label} />
    </div>
  );
}

export function MlAvailabilityCard({
  isActive,
  onActiveChange,
  isFeatured = false,
  onFeaturedChange,
  isOnSale = false,
  onOnSaleChange,
}: MlAvailabilityCardProps) {
  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
          Disponibilidad
        </h2>

        <div className="flex flex-col gap-5">
          <SwitchRow
            label="Visible en catálogo"
            description="Los clientes pueden ver este producto"
            isSelected={isActive}
            onValueChange={onActiveChange}
          />
          {onFeaturedChange && (
            <SwitchRow
              label="Destacado (POPULAR)"
              description="Sale primero en el catálogo, con el badge POPULAR"
              isSelected={isFeatured}
              onValueChange={onFeaturedChange}
            />
          )}
          {onOnSaleChange && (
            <SwitchRow
              label="En oferta"
              description="Muestra el badge y entra en el filtro En oferta; el precio no cambia"
              isSelected={isOnSale}
              onValueChange={onOnSaleChange}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
