export interface OrProductCardProps {
  title: string;
  description?: string;
  imageSrc: string;
  /** Texto alternativo de la imagen. Usa "" solo si la imagen es decorativa. */
  imageAlt: string;
  /**
   * Tipo de imagen (como en el mosaico del login): `cutout` recorte transparente con sombra de producto
   * (por defecto); `plate` foto con fondo ya igualado a `surface-sand`, sin sombra ni radio; `photo`
   * foto con fondo propio, a sangre (`object-cover`).
   */
  imageKind?: "cutout" | "plate" | "photo";
  /** Nivel del título dentro de la página. Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  /** Cantidad del stepper. Si no se pasa `onQuantityChange`, no se muestra el stepper. */
  quantity?: number;
  onQuantityChange?: (value: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
  /** Qué cuenta el stepper. Por defecto "cantidad de {title}" (nombres únicos si hay varias cards). */
  quantityLabel?: string;
  /** Texto del CTA. Por defecto "Ordenar ahora". */
  ctaLabel?: string;
  onCtaPress?: () => void;
  /** Si se pasa, el CTA es un enlace. */
  ctaHref?: string;
  isCtaLoading?: boolean;
  /** Fuerza el estado hover (catálogo y pruebas visuales). */
  isHovered?: boolean;
  className?: string;
}
