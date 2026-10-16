import { Ref } from "react";

export interface MlCartLineProps {
  /** Nombre del producto o combo. `null` mientras se carga: se pinta un esqueleto. */
  name: string | null;
  /** Foto de la línea (si no hay, la del producto por defecto: la pone el caller). */
  imageSrc: string;
  /** "2 unidades · 8 personas". */
  detail: string;
  /** Quita la línea. Sin valor no se pinta el botón. */
  onRemove?: () => void;
  /** Petición de quitar en curso: el botón queda inerte con indicador. */
  isRemoving?: boolean;
  /** Otra línea se está quitando: este botón queda inerte (`aria-disabled`) hasta que termine. */
  isRemoveDisabled?: boolean;
  /** Ref del botón de quitar (para mover el foco al quitar otra línea). */
  removeButtonRef?: Ref<HTMLButtonElement>;
  className?: string;
}
