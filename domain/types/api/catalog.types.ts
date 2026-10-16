// Catálogo del cliente para la pantalla Ordenar: `GET /api/catalog` (gestion/CONTRATOS-API.md, T-19a).

/** Valor de `filter`: todos (por defecto), creados en los últimos 30 días o marcados en oferta. */
export type CatalogFilter = "all" | "new" | "on-sale";

/** Query de `GET /catalog`. Todos opcionales; sin `section` = "Todos". */
export interface CatalogQuery {
  lang?: "es" | "en";
  /** Slug de una `Section` activa. Un slug inexistente responde 404. */
  section?: string;
  /** Ids de `Tag`: el ítem debe tenerlos **todos**. Se envían separados por coma. */
  tags?: string[];
  filter?: CatalogFilter;
  /** ≥ 2 caracteres (con menos, 400). */
  search?: string;
  page?: number;
  /** 12 por defecto, máximo 48. */
  pageSize?: number;
}

/** Sección activa del catálogo. `count` no depende de los demás filtros. */
export interface CatalogCategory {
  slug: string;
  name: string;
  order: number;
  count: number;
}

export interface CatalogTag {
  id: string;
  name: string;
}

/** `product` (id de `Product`) o `combo` (id de `Combo`, los "surtidos": precio único y sin tags). */
export type CatalogItemKind = "product" | "combo";

export interface CatalogItem {
  id: string;
  kind: CatalogItemKind;
  name: string;
  description: string | null;
  image: string | null;
  /** Decimal en string (`"45.00"`), calculado por el servidor. */
  priceFrom: string;
  priceTo: string;
  tags: CatalogTag[];
  /** Creado en los últimos 30 días (hora de Caracas). */
  isNew: boolean;
  /** Badge "POPULAR" (lo marca el admin). */
  isFeatured: boolean;
  /** "En oferta" (lo marca el admin; aún no cambia el precio). */
  isOnSale: boolean;
}

export interface CatalogItemsPage {
  data: CatalogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CatalogResponse {
  categories: CatalogCategory[];
  /** Ítems activos del catálogo: el conteo de "Todos". */
  totalItems: number;
  /** Tags activos con al menos un ítem activo. */
  preferences: CatalogTag[];
  items: CatalogItemsPage;
}

// Ficha de un ítem: `GET /api/catalog/items/:kind/:id` (gestion/CONTRATOS-API.md, T-19c).

/** Tamaño activo de un producto, como opción de "Selecciona la cantidad de personas". */
export interface CatalogServingOption {
  /** id de `ProductSize`: es el `productSizeId` de `POST /cart/items`. */
  sizeId: string;
  /** Nombre del tamaño ("8 personas"). Se muestra si `servings` es `null`. */
  label: string;
  servings: number | null;
  /** Decimal en string, calculado por el servidor. */
  price: string;
  isDefault: boolean;
}

/** Producto que forma parte de un combo. */
export interface CatalogComboItem {
  productId: string;
  name: string;
  quantity: number;
}

export interface CatalogIngredient {
  id: string;
  name: string;
  image: string | null;
}

/**
 * Información nutricional. En gramos (1 decimal como máximo) salvo `energyKj`, `calories` (kcal), `cholesterolMg`
 * y `sodiumMg`. Si el producto tiene al menos un campo cargado llega el objeto completo, con `null` en los demás.
 */
export interface CatalogNutrition {
  energyKj: number | null;
  calories: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbohydrates: number | null;
  sugar: number | null;
  fiber: number | null;
  cholesterolMg: number | null;
  sodiumMg: number | null;
}

export interface CatalogItemDetail {
  id: string;
  kind: CatalogItemKind;
  name: string;
  description: string | null;
  /** Imagen principal primero y luego la galería. Puede venir vacía. */
  images: string[];
  isFeatured: boolean;
  isOnSale: boolean;
  isNew: boolean;
  tags: CatalogTag[];
  /** Tamaños del producto por `sortOrder`. En un combo, `[]`. */
  servingOptions: CatalogServingOption[];
  /**
   * Precio único (decimal en string): el del combo o, en un producto sin tamaños (`servingOptions: []`), su precio
   * base. En un producto con tamaños, `null` (el precio va en cada opción).
   */
  price: string | null;
  /** Solo combos. */
  comboItems: CatalogComboItem[];
  ingredients: CatalogIngredient[];
  /** `null` si no está cargada (y siempre en combos). */
  nutrition: CatalogNutrition | null;
  /** Algún grupo de modificadores exige elegir (`minSelect > 0`): la ficha no puede añadirlo sola. */
  hasRequiredModifiers: boolean;
  /** Hasta 8 ítems, con la forma de `GET /catalog`. */
  recommendations: CatalogItem[];
}
