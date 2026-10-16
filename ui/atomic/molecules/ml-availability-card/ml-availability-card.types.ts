export interface MlAvailabilityCardProps {
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
  /** "Destacado (POPULAR)" en el catálogo. Sin `onFeaturedChange` no se pinta. */
  isFeatured?: boolean;
  onFeaturedChange?: (isFeatured: boolean) => void;
  /** "En oferta" en el catálogo. Sin `onOnSaleChange` no se pinta. */
  isOnSale?: boolean;
  onOnSaleChange?: (isOnSale: boolean) => void;
}
