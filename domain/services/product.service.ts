import {
  CreateModifierGroupRequest,
  CreateModifierRequest,
  CreateProductRequest,
  CreateSizeRequest,
  Modifier,
  ModifierGroup,
  Product,
  ProductSize,
  UpdateModifierGroupRequest,
  UpdateModifierRequest,
  UpdateProductRequest,
  UpdateSizeRequest,
} from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

export const productService = {
  // --- Products ---

  getAll: (): Promise<Product[]> =>
    authFetcher<Product[]>("/products"),

  getById: (id: string): Promise<Product> =>
    authFetcher<Product>(`/products/${id}`),

  create: (data: CreateProductRequest): Promise<Product> =>
    authFetcher<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProductRequest): Promise<Product> =>
    authFetcher<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    authFetcher<void>(`/products/${id}`, {
      method: "DELETE",
    }),

  uploadImage: (id: string, file: File): Promise<Product> => {
    const formData = new FormData();
    formData.append("file", file);
    return authFetcher<Product>(`/products/${id}/image`, {
      method: "POST",
      body: formData,
    });
  },

  // --- Sizes ---

  getSizes: (productId: string): Promise<ProductSize[]> =>
    authFetcher<ProductSize[]>(`/products/${productId}/sizes`),

  createSize: (productId: string, data: CreateSizeRequest): Promise<ProductSize> =>
    authFetcher<ProductSize>(`/products/${productId}/sizes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSize: (
    productId: string,
    id: string,
    data: UpdateSizeRequest,
  ): Promise<ProductSize> =>
    authFetcher<ProductSize>(`/products/${productId}/sizes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteSize: (productId: string, id: string): Promise<void> =>
    authFetcher<void>(`/products/${productId}/sizes/${id}`, {
      method: "DELETE",
    }),

  // --- Modifier Groups ---

  getModifierGroups: (productId: string): Promise<ModifierGroup[]> =>
    authFetcher<ModifierGroup[]>(`/products/${productId}/modifier-groups`),

  createModifierGroup: (
    productId: string,
    data: CreateModifierGroupRequest,
  ): Promise<ModifierGroup> =>
    authFetcher<ModifierGroup>(`/products/${productId}/modifier-groups`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateModifierGroup: (
    productId: string,
    id: string,
    data: UpdateModifierGroupRequest,
  ): Promise<ModifierGroup> =>
    authFetcher<ModifierGroup>(`/products/${productId}/modifier-groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // --- Modifiers ---

  getModifiers: (productId: string, groupId: string): Promise<Modifier[]> =>
    authFetcher<Modifier[]>(
      `/products/${productId}/modifier-groups/${groupId}/modifiers`,
    ),

  createModifier: (
    productId: string,
    groupId: string,
    data: CreateModifierRequest,
  ): Promise<Modifier> =>
    authFetcher<Modifier>(
      `/products/${productId}/modifier-groups/${groupId}/modifiers`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  updateModifier: (
    productId: string,
    groupId: string,
    id: string,
    data: UpdateModifierRequest,
  ): Promise<Modifier> =>
    authFetcher<Modifier>(
      `/products/${productId}/modifier-groups/${groupId}/modifiers/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),
};
