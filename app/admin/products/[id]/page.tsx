"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Spinner } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

import {
  AtButton,
  MlAvailabilityCard,
  MlImageUpload,
  OgModifierGroupsSection,
  OgProductForm,
  OgSizesSection,
} from "@/libs/cantaritos-ui";
import { ProductFormValues } from "@/libs/cantaritos-ui/organisms/og-product-form";
import { useProduct, useUpdateProduct, useUploadProductImage } from "@/domain/hooks/products";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();

  // null = user hasn't toggled yet, use product value
  const [isActiveOverride, setIsActiveOverride] = useState<boolean | null>(null);
  const isActive = isActiveOverride ?? product?.isActive ?? true;

  const isSaving = updateProduct.isPending || uploadImage.isPending;

  const handleSubmit = (values: ProductFormValues) => {
    if (!values.name.trim()) return;

    const basePrice = Number(values.basePrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) return;

    const stock = values.stock ? Number(values.stock) : undefined;
    if (stock !== undefined && (!Number.isFinite(stock) || stock < 0)) return;

    updateProduct.mutate(
      {
        id,
        data: {
          name: values.name.trim(),
          description: values.description || undefined,
          basePrice,
          stock,
          isActive,
        },
      },
      {
        onSuccess: () => router.push("/admin/products"),
      },
    );
  };

  const handleImageUpload = (file: File) => {
    uploadImage.mutate({ id, file });
  };

  if (isLoadingProduct) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner label="Cargando producto..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Producto no encontrado</p>
      </div>
    );
  }

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
              <span className="text-gray-400">Editar</span>
            </nav>
            <h1 className="text-xl font-bold">{product.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AtButton
            variant="bordered"
            onPress={() => router.push("/admin/products")}
          >
            Cancelar
          </AtButton>
          <AtButton
            color="primary"
            type="submit"
            form="product-form"
            isLoading={isSaving}
          >
            Guardar Cambios
          </AtButton>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <OgProductForm
            defaultValues={{
              name: product.name,
              description: product.description ?? "",
              basePrice: product.basePrice.toString(),
              stock: product.stock?.toString() ?? "",
            }}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
          <OgSizesSection
            productId={id}
            sizes={product.sizes ?? []}
          />
          <OgModifierGroupsSection
            productId={id}
            modifierGroups={product.modifierGroups ?? []}
          />
        </div>
        <div className="space-y-6">
          <MlImageUpload
            currentImage={product.image}
            onFileSelect={handleImageUpload}
            isUploading={uploadImage.isPending}
          />
          <MlAvailabilityCard
            isActive={isActive}
            onActiveChange={setIsActiveOverride}
          />
        </div>
      </div>

      {/* Error */}
      {(updateProduct.error || uploadImage.error) && (
        <p className="text-sm text-red-500">
          {updateProduct.error?.message ||
            uploadImage.error?.message ||
            "Error al actualizar producto"}
        </p>
      )}
    </div>
  );
}
