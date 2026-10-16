export interface MlPaginationProps {
  /** Página actual (desde 1). */
  page: number;
  /** Número total de páginas. Con 1 o menos no se pinta nada. */
  totalPages: number;
  onChange: (page: number) => void;
  /** Nombre accesible del `<nav>` ("Páginas del catálogo"). */
  label: string;
  className?: string;
}
