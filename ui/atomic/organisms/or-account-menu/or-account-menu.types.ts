export interface OrAccountMenuUser {
  /** Nombre completo: cabecera del menú, texto alternativo e iniciales del avatar. */
  name: string;
  email?: string;
  avatarSrc?: string;
  /** Empresa activa (la del `X-Company-Id`). Sin valor no se pinta la fila de empresa. */
  companyName?: string;
  /** Rol en la empresa activa ("Comprador"). */
  role?: string;
}

export interface OrAccountMenuItem {
  key: string;
  label: string;
  /**
   * Pantalla a la que lleva. Sin valor, el ítem sale deshabilitado con la etiqueta "Pronto" (la pantalla aún no
   * existe): activarlo es añadir el `href`.
   */
  href?: string;
}

export interface OrAccountMenuProps {
  user: OrAccountMenuUser;
  /** Opciones de la cuenta, por orden ("Mi perfil", "Datos de la empresa", "Métodos de pago"). */
  items: OrAccountMenuItem[];
  /** Si se pasa, aparece "Cerrar sesión" al final, separado del resto. */
  onLogout?: () => void;
  /** Cierre de sesión en curso: el ítem muestra "Cerrando sesión…" y no responde. */
  isLoggingOut?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Id base de la cabecera (`<id>-header`, el `aria-describedby` del menú). Por defecto `account-menu`. */
  id?: string;
  className?: string;
}
