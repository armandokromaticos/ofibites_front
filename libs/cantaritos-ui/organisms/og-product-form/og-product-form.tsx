"use client";

import { Card, CardBody } from "@heroui/react";
import { Info } from "lucide-react";

import { AtInput } from "@/libs/cantaritos-ui/atoms";
import { AtTextarea } from "@/libs/cantaritos-ui/atoms";
import { MlForm } from "@/libs/cantaritos-ui/molecules";

import { OgProductFormProps } from "./og-product-form.types";

export function OgProductForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: OgProductFormProps) {
  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Información General</h2>
        </div>

        <MlForm
          id="product-form"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSubmit({
              name: (formData.get("name") ?? "").toString().trim(),
              description: (formData.get("description") ?? "").toString().trim(),
              basePrice: (formData.get("basePrice") ?? "").toString().trim(),
              stock: (formData.get("stock") ?? "").toString().trim(),
            });
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AtInput
              label="Nombre del producto"
              name="name"
              placeholder="Ej: Cantarito"
              defaultValue={defaultValues?.name}
              isRequired
              isDisabled={isLoading}
            />
            <AtInput
              label="Precio base ($)"
              name="basePrice"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.basePrice}
              isRequired
              isDisabled={isLoading}
            />
          </div>

          <AtTextarea
            label="Descripción"
            name="description"
            placeholder="Descripción del producto..."
            defaultValue={defaultValues?.description}
            minRows={3}
            isDisabled={isLoading}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AtInput
              label="Stock"
              name="stock"
              type="number"
              placeholder="0"
              min="0"
              defaultValue={defaultValues?.stock}
              isDisabled={isLoading}
            />
          </div>
        </MlForm>
      </CardBody>
    </Card>
  );
}
