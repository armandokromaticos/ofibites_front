import { Ref } from "react";

export interface OrCartLineItemProps {
  /** `null` mientras se carga (esqueleto). */
  name: string | null;
  imageSrc: string;
  /** Ficha del producto (el nombre enlaza aquí). */
  href?: string;
  /** "Para 8 personas". */
  description?: string | null;
  /** Etiquetas del producto como chips ("Sin gluten"). */
  tags?: string[];
  /** Precio por unidad ya formateado ("$48"): lo calcula el servidor. Sin valor no se pinta (p. ej. con modificadores). */
  unitPriceLabel?: string;
  /** Subtotal de la línea ya formateado ("$96"). */
  subtotalLabel: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  /** Hay un cambio de cantidad pendiente de confirmar por el servidor. */
  isUpdating?: boolean;
  /** Aviso de la línea ("Ya no está disponible…"), en `danger-700`. */
  notice?: string | null;
  /** La cantidad no se puede cambiar (p. ej. línea no disponible): stepper deshabilitado. */
  isQuantityDisabled?: boolean;
  onRemove: () => void;
  isRemoving?: boolean;
  /** Ref del botón "Eliminar" (para mover el foco al quitar otra línea). */
  removeButtonRef?: Ref<HTMLButtonElement>;
  /** Nivel del título. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}
