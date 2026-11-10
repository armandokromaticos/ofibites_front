export interface MlProductMiniCardProps {
  name: string;
  imageSrc: string;
  /** Precio ya formateado ("Desde $18"): lo calcula el servidor. */
  priceLabel: string;
  /** Ficha del producto: la card entera la abre. */
  href: string;
  /** Nombre accesible del enlace a la ficha. Por defecto "Ver <nombre>" (o el nombre, con `onAdd`). */
  linkLabel?: string;
  /** Si se pasa, el "+" añade al carrito sin salir (ítems sin nada que elegir) en vez de abrir la ficha. */
  onAdd?: () => void;
  /** Añadiendo: spinner en el "+". */
  isAdding?: boolean;
  /** Nombre accesible del "+" con `onAdd`. Por defecto "Añadir <nombre> al carrito". */
  addLabel?: string;
  /** Nivel del título. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}
