export interface MlGreetingCardProps {
  /** Nombre del usuario ("María Gabriela"). */
  name: string;
  /** Saludo sobre el nombre. Por defecto "Hola". */
  greeting?: string;
  /** Pregunta bajo el nombre. Por defecto "¿Qué quieres pedir hoy?". */
  prompt?: string;
  /** Texto del CTA. Por defecto "Realizar pedido". */
  ctaLabel?: string;
  /** Si se pasa, el CTA es un enlace. */
  ctaHref?: string;
  onCtaPress?: () => void;
  /** Esqueleto mientras carga el nombre. */
  isLoading?: boolean;
  /** Nivel del título (saludo + nombre). Por defecto 2. */
  headingLevel?: 2 | 3;
  className?: string;
}
