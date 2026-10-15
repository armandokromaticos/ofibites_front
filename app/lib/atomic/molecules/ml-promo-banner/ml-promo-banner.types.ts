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
  /** Texto del CTA (botón en `main`; con `href`, texto del enlace de `secondary`). Sin `ctaLabel` no se pinta el botón. */
  ctaLabel?: string;
  onCtaPress?: () => void;
  /** Si se pasa, el CTA es un enlace. */
  ctaHref?: string;
  /**
   * Entrada del contenido al montar: título, subtítulo y CTA suben escalonados (0/80/160 ms) y la
   * foto entra deslizando. Para el cambio de diapositiva de un carrusel, no para la carga de la página.
   */
  animateEntrance?: boolean;
  /**
   * Solo `secondary`: cómo reacciona la imagen al pasar o enfocar el banner. `tilt` inclina desde la base
   * (botellas), `zoom` crece y gira un poco (cajas). Sin valor, la imagen queda quieta.
   */
  imageHover?: "tilt" | "zoom";
  /**
   * Solo `secondary`: la card entera es un enlace a `href` y, al pasar o enfocar, aparece `ctaLabel`
   * (por defecto "Explorar") con una flecha. Sin `href` la card no es interactiva.
   */
  href?: string;
  /** Nombre accesible del enlace (`href`). Por defecto "Ver <título en minúsculas>". */
  linkLabel?: string;
  className?: string;
}
