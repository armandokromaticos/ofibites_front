import { MlPromoBannerProps } from "@/ui/atomic/molecules";

export type OrPromoCarouselSlide = Omit<MlPromoBannerProps, "variant" | "headingLevel" | "animateEntrance" | "className"> & {
  id: string;
};

export interface OrPromoCarouselProps {
  slides: OrPromoCarouselSlide[];
  /** Nombre accesible del carrusel. Por defecto "Promociones". */
  label?: string;
  /** Nivel del título de cada banner. Por defecto 2. */
  headingLevel?: 1 | 2 | 3;
  /**
   * Segundos por diapositiva en autoplay. Por defecto `carousel.interval` (6 s) de `shared/motion`.
   * Con movimiento reducido el carrusel arranca en pausa.
   */
  autoplayInterval?: number;
  className?: string;
}
