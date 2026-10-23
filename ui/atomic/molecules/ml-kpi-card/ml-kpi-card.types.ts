export interface MlKpiCardProps {
  title: string;
  /** Ya formateado ("112", "$16.420,80"): el valor es decorativo (Playfair), no se formatea aquí. */
  value: string;
  subtitle?: string;
  subtitleTone?: "default" | "success" | "danger";
  /** Enlace secundario debajo del subtítulo (p. ej. "Ver pedidos"). */
  link?: { label: string; href: string };
  className?: string;
}
