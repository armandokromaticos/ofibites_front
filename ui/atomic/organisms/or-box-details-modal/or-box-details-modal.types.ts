export interface OrBoxDetailsIngredient {
  id: string;
  name: string;
  /** Foto del ingrediente (se pinta en círculo). Sin ella, su inicial. */
  imageSrc: string | null;
}

/**
 * Información nutricional (la del contrato del catálogo). En gramos salvo energía, calorías, colesterol y sodio.
 * Un valor `null` (no cargado) no se muestra.
 */
export interface OrBoxDetailsNutrition {
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

export interface OrBoxDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Nombre del producto: completa el nombre accesible del diálogo ("Detalles de la caja: <nombre>"). */
  productName: string;
  /** Foto superior, a sangre. Decorativa por defecto (el nombre ya está en el título). */
  imageSrc: string;
  imageAlt?: string;
  ingredients: OrBoxDetailsIngredient[];
  /** `null`: el bloque dice "Sin información nutricional". */
  nutrition: OrBoxDetailsNutrition | null;
}
