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
  /**
   * `chips` (por defecto): píldoras de 30 px del dashboard, activa en `primary`. `pills`: filtros de Ordenar
   * (Figma 3067:17606), píldoras de 40 px en blanco con Inter 14 y la activa en `nav-active` y negrita.
   */
  appearance?: "chips" | "pills";
  /** `horizontal` (por defecto, con scroll si no cabe) o `vertical` (columna de filtros). */
  orientation?: "horizontal" | "vertical";
  className?: string;
}
