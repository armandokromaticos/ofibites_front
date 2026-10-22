import { MlSectionNavProps } from "@/ui/atomic/molecules";

export interface OrProfileCardProps {
  /** Nombre completo: título de la tarjeta e iniciales del avatar. */
  name: string;
  email: string;
  avatarSrc?: string;
  /** "Comprador · Torre Principal": rol en la empresa activa y sede. Sin valor no se pinta la etiqueta. */
  roleLabel?: string;
  /** Secciones del perfil (navegación de la tarjeta). */
  nav: Omit<MlSectionNavProps, "className">;
  className?: string;
}
