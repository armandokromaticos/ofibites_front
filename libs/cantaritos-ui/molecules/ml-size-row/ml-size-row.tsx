"use client";

import { useState } from "react";

import { Check, GripVertical,Trash2 } from "lucide-react";

import { AtButton, AtInput } from "@/libs/cantaritos-ui/atoms";

import { MlSizeRowProps } from "./ml-size-row.types";

export function MlSizeRow({
  size,
  onSave,
  onDelete,
  isLoading = false,
}: MlSizeRowProps) {
  const [name, setName] = useState(size?.name ?? "");
  const [price, setPrice] = useState(size?.price?.toString() ?? "");
  const [stock, setStock] = useState(size?.stock?.toString() ?? "");

  const handleSave = () => {
    if (!name.trim() || !price.trim()) return;
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return;

    let parsedStock: number | null = null;
    if (stock.trim() !== "") {
      const stockNum = Number(stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) return;
      parsedStock = stockNum;
    }

    onSave({ name: name.trim(), price: parsedPrice, stock: parsedStock });
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <GripVertical className="h-5 w-5 shrink-0 text-gray-400" />
      <div className="flex-1">
        <AtInput
          size="sm"
          placeholder="Nombre del tamaño"
          value={name}
          onValueChange={setName}
          isDisabled={isLoading}
        />
      </div>
      <div className="w-32">
        <AtInput
          size="sm"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          startContent={<span className="text-sm text-gray-400">$</span>}
          value={price}
          onValueChange={setPrice}
          isDisabled={isLoading}
        />
      </div>
      <div className="w-28">
        <AtInput
          size="sm"
          type="number"
          placeholder="Stock"
          step="1"
          min="0"
          value={stock}
          onValueChange={setStock}
          isDisabled={isLoading}
        />
      </div>
      <AtButton
        isIconOnly
        variant="light"
        size="sm"
        color="primary"
        onPress={handleSave}
        isLoading={isLoading}
        aria-label="Guardar tamaño"
      >
        <Check className="h-4 w-4" />
      </AtButton>
      {onDelete && (
        <AtButton
          isIconOnly
          variant="light"
          size="sm"
          color="danger"
          onPress={onDelete}
          isDisabled={isLoading}
          aria-label="Eliminar tamaño"
        >
          <Trash2 className="h-4 w-4" />
        </AtButton>
      )}
    </div>
  );
}
