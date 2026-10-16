export interface MlProductGalleryProps {
  /** Fotos del producto: la primera es la principal. Con una sola no hay miniaturas; sin ninguna, `fallbackSrc`. */
  images: string[];
  /** Nombre del producto: base del texto alternativo ("<nombre>, foto 2 de 5"). */
  productName: string;
  /** Imagen si `images` está vacío. */
  fallbackSrc: string;
  /** Carga prioritaria de la foto principal (está en el primer viewport). */
  preload?: boolean;
  className?: string;
}
