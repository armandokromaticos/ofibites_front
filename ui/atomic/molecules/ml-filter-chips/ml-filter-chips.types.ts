export interface MlFilterChipsOption<T extends string = string> {
  value: T;
  label: string;
}

export interface MlFilterChipsProps<T extends string = string> {
  /** Nombre accesible del grupo ("Filtrar recomendaciones"). */
  label: string;
  options: MlFilterChipsOption<T>[];
  /** Valor activo (un solo filtro a la vez). */
  value: T;
  onChange: (value: T) => void;
  className?: string;
}
