export interface MlProductMiniCardProps {
  name: string;
  imageSrc: string;
  /** Precio ya formateado ("Desde $18"): lo calcula el servidor. */
  priceLabel: string;
  /** Ficha del producto: el "+" es el enlace. */
  href: string;
  /** Nombre accesible del enlace. Por defecto "Ver <nombre>". */
  linkLabel?: string;
  /** Nivel del título. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}
