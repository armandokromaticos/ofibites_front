// --- Product ---

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  image?: string;
  stock?: number;
  isActive: boolean;
  standId?: string;
  createdAt: string;
  updatedAt: string;
  sizes: ProductSize[];
  modifierGroups: ModifierGroup[];
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  basePrice: number;
  image?: string;
  stock?: number;
  isActive?: boolean;
  standId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  image?: string;
  stock?: number;
  isActive?: boolean;
  standId?: string;
}

// --- Product Size ---

export interface ProductSize {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock?: number | null;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateSizeRequest {
  name: string;
  price: number;
  stock?: number | null;
  sortOrder?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateSizeRequest {
  name?: string;
  price?: number;
  stock?: number | null;
  sortOrder?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

// --- Modifier Group ---

export interface ModifierGroup {
  id: string;
  productId: string;
  name: string;
  description?: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  isRequired: boolean;
  modifiers: Modifier[];
}

export interface CreateModifierGroupRequest {
  name: string;
  description?: string;
  minSelect?: number;
  maxSelect?: number;
  sortOrder?: number;
}

export interface UpdateModifierGroupRequest {
  name?: string;
  description?: string;
  minSelect?: number;
  maxSelect?: number;
  sortOrder?: number;
}

// --- Modifier ---

export interface Modifier {
  id: string;
  groupId: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateModifierRequest {
  name: string;
  priceAdjustment?: number;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateModifierRequest {
  name?: string;
  priceAdjustment?: number;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
