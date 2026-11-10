export interface MlPaginationProps {
  /** Página actual (desde 1). */
  page: number;
  /** Número total de páginas. Con 1 o menos no se pinta nada. */
  totalPages: number;
  onChange: (page: number) => void;
  /** Nombre accesible del `<nav>` ("Páginas del catálogo"). */
  label: string;
  /** `background` (por defecto, sobre el fondo crema): píldoras blancas de 40 px. `card` (dentro de una card blanca,
   *  como el pie de la tabla de pedidos, Figma 3562:1504): píldoras crema de 32 px. */
  surface?: "background" | "card";
  className?: string;
}
