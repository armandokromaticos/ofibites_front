"use client";

import { Card, CardBody } from "@heroui/react";

import { MlStatCardProps } from "./ml-stat-card.types";

const subtitleColorMap: Record<string, string> = {
  default: "text-gray-500",
  success: "text-green-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export function MlStatCard({
  title,
  value,
  subtitle,
  subtitleColor = "default",
  icon,
}: MlStatCardProps) {
  return (
    <Card shadow="sm">
      <CardBody className="flex flex-row items-center gap-4 p-4">
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{title}</span>
          <span className="text-2xl font-bold">{value}</span>
          {subtitle && (
            <span className={`text-xs ${subtitleColorMap[subtitleColor]}`}>
              {subtitle}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
