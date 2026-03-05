"use client";

import { Card, CardBody } from "@heroui/react";

import { AtSwitch } from "@/libs/cantaritos-ui/atoms";

import { MlAvailabilityCardProps } from "./ml-availability-card.types";

export function MlAvailabilityCard({
  isActive,
  onActiveChange,
}: MlAvailabilityCardProps) {
  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
          Disponibilidad
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Visible en catálogo</span>
            <span className="text-xs text-gray-500">
              Los clientes pueden ver este producto
            </span>
          </div>
          <AtSwitch
            isSelected={isActive}
            onValueChange={onActiveChange}
            aria-label="Visible en catálogo"
          />
        </div>
      </CardBody>
    </Card>
  );
}
