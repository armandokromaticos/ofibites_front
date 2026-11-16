export interface MlSearchBarProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Nombre accesible del campo. Por defecto, el placeholder. */
  label?: string;
  /**
   * `compact` (por defecto): barra de 40 px centrada de las tablas del admin. `catalog`: buscador de Ordenar,
   * 48 px, lupa a la izquierda, texto alineado al inicio y botón para borrar. `inset`: como `catalog` pero dentro
   * de una card blanca (barra de filtros de Pedidos, Figma 3562:1382): 40 px, crema, sin borde y texto regular de 14 px.
   */
  variant?: "compact" | "catalog" | "inset";
  className?: string;
}
