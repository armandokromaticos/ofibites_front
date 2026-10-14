export type MlPromoBannerVariant = "main" | "secondary";

export interface MlPromoBannerProps {
  /** `main`: banner grande del Dashboard (h307, display 53). `secondary`: banner de categoría (h188, h2 35). */
  variant?: MlPromoBannerVariant;
  title: string;
  subtitle?: string;
  imageSrc: string;
  /** Texto alternativo de la imagen. Usa "" si la imagen no aporta información. */
  imageAlt: string;
  /** Lado de la imagen. Por defecto `end` en `main` y `start` en `secondary`. */
  imagePosition?: "start" | "end";
  /** Nivel del título dentro de la página. Por defecto 2. */
  headingLevel?: 1 | 2 | 3;
  /** Texto del CTA. Sin `ctaLabel` no se pinta el botón. */
  ctaLabel?: string;
  onCtaPress?: () => void;
  /** Si se pasa, el CTA es un enlace. */
  ctaHref?: string;
  className?: string;
}
