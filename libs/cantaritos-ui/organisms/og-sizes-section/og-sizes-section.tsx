"use client";

import { useState } from "react";

import { Card, CardBody } from "@heroui/react";
import { Plus,Ruler } from "lucide-react";

import { AtButton } from "@/libs/cantaritos-ui/atoms";
import { MlSizeRow } from "@/libs/cantaritos-ui/molecules";
import { useCreateSize, useDeleteSize, useUpdateSize } from "@/domain/hooks/products";
import { ProductSize } from "@/domain/types";

import { OgSizesSectionProps } from "./og-sizes-section.types";

export function OgSizesSection({ productId, sizes }: OgSizesSectionProps) {
  const createSize = useCreateSize();
  const updateSize = useUpdateSize();
  const deleteSize = useDeleteSize();
  const [showNewRow, setShowNewRow] = useState(false);
  const [updatingSizeId, setUpdatingSizeId] = useState<string | null>(null);

  const handleCreateSize = (values: { name: string; price: number; stock?: number | null }) => {
    createSize.mutate(
      { productId, data: { name: values.name, price: values.price, stock: values.stock } },
      { onSuccess: () => setShowNewRow(false) },
    );
  };

  const handleUpdateSize = (
    sizeId: string,
    values: { name: string; price: number; stock?: number | null },
  ) => {
    setUpdatingSizeId(sizeId);
    updateSize.mutate(
      {
        productId,
        id: sizeId,
        data: { name: values.name, price: values.price, stock: values.stock },
      },
      { onSettled: () => setUpdatingSizeId(null) },
    );
  };

  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Tamaños y Variaciones</h2>
          </div>
          <AtButton
            variant="light"
            size="sm"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setShowNewRow(true)}
          >
            Agregar Tamaño
          </AtButton>
        </div>

        <div className="space-y-3">
          {sizes.map((size: ProductSize) => (
            <MlSizeRow
              key={size.id}
              size={size}
              onSave={(values) => handleUpdateSize(size.id, values)}
              onDelete={() => deleteSize.mutate({ productId, id: size.id })}
              isLoading={updatingSizeId === size.id}
            />
          ))}

          {showNewRow && (
            <MlSizeRow
              onSave={handleCreateSize}
              onDelete={() => setShowNewRow(false)}
              isLoading={createSize.isPending}
            />
          )}

          {sizes.length === 0 && !showNewRow && (
            <p className="py-4 text-center text-sm text-gray-500">
              No hay tamaños configurados. Agrega uno para ofrecer variaciones.
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
