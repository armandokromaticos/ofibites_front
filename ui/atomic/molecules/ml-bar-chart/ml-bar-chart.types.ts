export interface MlBarChartPoint {
  key: string;
  /** Etiqueta corta bajo la barra ("01", "02"...). */
  label: string;
  value: number;
}

export interface MlBarChartProps {
  points: MlBarChartPoint[];
  /** Resalta una barra (p. ej. el día pico) con el color de marca en vez del tono por defecto. */
  highlightKey?: string;
  /** Resumen para lectores de pantalla; las barras no son texto. */
  ariaLabel: string;
  className?: string;
}
