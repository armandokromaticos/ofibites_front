export interface MlCategoryPickerOption<T extends string = string> {
  value: T;
  name: string;
  /** Texto secundario ("26 productos"). */
  caption?: string;
  /** Ilustración de la categoría (decorativa: el nombre ya la describe). */
  imageSrc: string;
}

export interface MlCategoryPickerProps<T extends string = string> {
  /** Nombre accesible del grupo ("Categorías"). */
  label: string;
  options: MlCategoryPickerOption<T>[];
  /** Categoría seleccionada (una a la vez). */
  value: T;
  onChange: (value: T) => void;
  className?: string;
}
