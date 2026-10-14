import { MlPromoBannerProps } from "@/app/lib/atomic/molecules";

export type OrPromoCarouselSlide = Omit<MlPromoBannerProps, "variant" | "headingLevel" | "className"> & {
  id: string;
};

export interface OrPromoCarouselProps {
  slides: OrPromoCarouselSlide[];
  /** Nombre accesible del carrusel. Por defecto "Promociones". */
  label?: string;
  /** Nivel del título de cada banner. Por defecto 2. */
  headingLevel?: 1 | 2 | 3;
  className?: string;
}
