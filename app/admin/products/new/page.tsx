"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  AtButton,
  MlAvailabilityCard,
  MlImageUpload,
  OgProductForm,
} from "@/libs/cantaritos-ui";
import { ProductFormValues } from "@/libs/cantaritos-ui/organisms/og-product-form";
import { useCreateProduct, useUploadProductImage } from "@/domain/hooks/products";

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const uploadImage = useUploadProductImage();

  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isLoading = createProduct.isPending || uploadImage.isPending;

  const handleSubmit = (values: ProductFormValues) => {
    if (!values.name.trim()) return;

    const basePrice = Number(values.basePrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) return;

    const stock = values.stock ? Number(values.stock) : undefined;
    if (stock !== undefined && (!Number.isFinite(stock) || stock < 0)) return;

    createProduct.mutate(
      {
        name: values.name.trim(),
        description: values.description || undefined,
        basePrice,
        stock,
        isActive,
      },
      {
        onSuccess: (product) => {
          if (selectedFile) {
            uploadImage.mutate(
              { id: product.id, file: selectedFile },
              { onSuccess: () => router.push("/admin/products") },
            );
          } else {
            router.push("/admin/products");
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AtButton
            as={Link}
            href="/admin/products"
            isIconOnly
            variant="light"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </AtButton>
          <div>
            <nav className="mb-1 flex text-xs text-gray-500">
              <Link href="/admin/products" className="hover:text-primary">
                Productos
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-400">Nuevo Producto</span>
            </nav>
            <h1 className="text-xl font-bold">Crear Producto</h1>
          </div>
        </div>
        <AtButton
          color="primary"
          type="submit"
          form="product-form"
          isLoading={isLoading}
        >
          Guardar
        </AtButton>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OgProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        <div className="space-y-6">
          <MlImageUpload
            onFileSelect={setSelectedFile}
            isUploading={uploadImage.isPending}
          />
          <MlAvailabilityCard
            isActive={isActive}
            onActiveChange={setIsActive}
          />
        </div>
      </div>

      {/* Error */}
      {(createProduct.error || uploadImage.error) && (
        <p className="text-sm text-red-500">
          {createProduct.error?.message ||
            uploadImage.error?.message ||
            "Error al crear producto"}
        </p>
      )}
    </div>
  );
}
