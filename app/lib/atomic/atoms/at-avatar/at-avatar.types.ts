export type AtAvatarSize = "md";

export interface AtAvatarProps {
  /** Nombre de la persona: texto alternativo de la foto y fuente de las iniciales si no hay foto. */
  name: string;
  /** Foto. Sin valor (o si no carga) se muestran las iniciales de `name`. */
  src?: string;
  /** `md` = 40 px (top bar y sidebar del Figma). */
  size?: AtAvatarSize;
  /**
   * El nombre ya se lee al lado (p. ej. sidebar abierto): el avatar sale del árbol accesible para no
   * repetirlo.
   */
  isDecorative?: boolean;
  className?: string;
}
