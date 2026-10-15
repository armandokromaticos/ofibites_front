export interface OrProductMarqueeItem {
  id: string;
  /** Nombre del surtido, tal como sale en el catálogo. */
  name: string;
  /** Segunda línea corta ("Desayunos", "Bebidas"...). Omítela si repetiría el nombre. */
  category?: string;
  imageSrc: string;
  /**
   * `cutout`: PNG/WebP recortado sobre transparente (casi a sangre, con la sombra de producto).
   * `photo`: foto con su propio fondo (llena la caja, radio 12).
   * `plate`: foto cuyo fondo ya es exactamente `surface-sand`: se funde con la tarjeta, sin sombra.
   */
  kind: "cutout" | "photo" | "plate";
}

export interface OrProductMarqueeProps {
  /**
   * Surtidos del mosaico, todos distintos. Los 9 primeros son las caras delanteras de las tres
   * columnas (tres por columna, en orden); los que sobran son caras traseras de la columna central.
   * Las columnas de los lados giran hacia los surtidos de la otra.
   */
  items: OrProductMarqueeItem[];
  /** Detiene el desplazamiento y los giros (p. ej. mientras el usuario escribe en el formulario). */
  paused?: boolean;
  /** Milisegundos entre dos giros de tarjeta. Por defecto 3200. */
  flipInterval?: number;
  className?: string;
}
