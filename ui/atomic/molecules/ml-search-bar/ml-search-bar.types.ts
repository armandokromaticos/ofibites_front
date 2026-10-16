export interface MlSearchBarProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Nombre accesible del campo. Por defecto, el placeholder. */
  label?: string;
  /**
   * `compact` (por defecto): barra de 40 px centrada de las tablas del admin. `catalog`: buscador de Ordenar,
   * 48 px, lupa a la izquierda, texto alineado al inicio y botón para borrar.
   */
  variant?: "compact" | "catalog";
  className?: string;
}
