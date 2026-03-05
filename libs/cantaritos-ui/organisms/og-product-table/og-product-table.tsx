"use client";

import {
  Image,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Package,Pencil, Trash2 } from "lucide-react";

import { AtButton, AtChip } from "@/libs/cantaritos-ui/atoms";
import { Product } from "@/domain/types";

import { OgProductTableProps } from "./og-product-table.types";

function StockCell({ stock }: { stock?: number }) {
  if (stock === undefined || stock === null) {
    return <span className="text-gray-400">—</span>;
  }
  if (stock === 0) {
    return <span className="font-medium text-red-600">0</span>;
  }
  if (stock <= 10) {
    return <span className="font-medium text-amber-600">{stock}</span>;
  }
  return <span>{stock}</span>;
}

function StatusChip({ isActive, stock }: { isActive: boolean; stock?: number }) {
  if (stock === 0) {
    return (
      <AtChip size="sm" variant="flat" color="danger">
        Sin Stock
      </AtChip>
    );
  }
  return (
    <AtChip size="sm" variant="flat" color={isActive ? "success" : "default"}>
      {isActive ? "Activo" : "Inactivo"}
    </AtChip>
  );
}

export function OgProductTable({
  products,
  onEdit,
  onDelete,
  isLoading = false,
}: OgProductTableProps) {
  return (
    <Table aria-label="Tabla de productos" shadow="sm">
      <TableHeader>
        <TableColumn>Producto</TableColumn>
        <TableColumn>Precio Base</TableColumn>
        <TableColumn>Stock</TableColumn>
        <TableColumn>Estado</TableColumn>
        <TableColumn width={120}>Acciones</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando productos..." />}
        emptyContent="No se encontraron productos."
      >
        {products.map((product: Product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <span className="font-medium">{product.name}</span>
              </div>
            </TableCell>
            <TableCell>${product.basePrice.toFixed(2)}</TableCell>
            <TableCell>
              <StockCell stock={product.stock} />
            </TableCell>
            <TableCell>
              <StatusChip isActive={product.isActive} stock={product.stock} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <AtButton
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => onEdit(product)}
                  aria-label="Editar producto"
                >
                  <Pencil className="h-4 w-4" />
                </AtButton>
                {onDelete && (
                  <AtButton
                    isIconOnly
                    variant="light"
                    size="sm"
                    color="danger"
                    onPress={() => onDelete(product)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AtButton>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
