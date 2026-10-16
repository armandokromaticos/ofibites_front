export interface OrCatalogCardProps {
  name: string;
  description?: string | null;
  imageSrc: string;
  /** Texto alternativo de la imagen. Usa "" si solo repite el nombre. */
  imageAlt: string;
  /** Precio ya formateado ("$45 – $120"): lo calcula el servidor, la card solo lo muestra. */
  priceLabel: string;
  /** Ficha del producto. Toda la card enlaza aquí; el botón "+" es el enlace (con foco y nombre). */
  href: string;
  /** Nombre accesible del enlace. Por defecto "Ver <nombre>". */
  linkLabel?: string;
  /** Badge "POPULAR". */
  isFeatured?: boolean;
  /** Badge "En oferta". */
  isOnSale?: boolean;
  /** Nivel del título dentro de la página. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  /** Carga prioritaria de la imagen (primeras cards visibles). */
  preloadImage?: boolean;
  className?: string;
}
