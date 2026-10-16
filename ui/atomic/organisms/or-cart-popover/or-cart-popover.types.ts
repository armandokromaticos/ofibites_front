export type OrCartPopoverStatus = "loading" | "error" | "unavailable" | "ready";

export interface OrCartPopoverLine {
  id: string;
  /** `null` mientras se carga (esqueleto). */
  name: string | null;
  imageSrc: string;
  /** "2 unidades · 8 personas". */
  detail: string;
}

export interface OrCartPopoverProps {
  /** Unidades del carrito: el badge del botón (0 lo oculta). */
  count?: number;
  /**
   * `loading`: primera carga · `error`: no se pudo leer (con `onRetry`) · `unavailable`: el usuario no tiene
   * carrito en la empresa activa (403 o sin empresa) · `ready`: con líneas o vacío.
   */
  status: OrCartPopoverStatus;
  lines: OrCartPopoverLine[];
  /** "Ver carrito". */
  cartHref: string;
  /** Enlace del estado vacío ("Explorar el menú"). */
  browseHref: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Quita una línea. Sin valor no hay botón de quitar. */
  onRemoveLine?: (lineId: string) => void;
  /** Línea que se está quitando. */
  removingLineId?: string | null;
  /** Vacía el carrito, tras confirmar en el propio panel. Sin valor no hay "Vaciar". */
  onClear?: () => void;
  isClearing?: boolean;
  /** Error de la última acción (quitar o vaciar), en español. */
  actionError?: string | null;
  /** Abierto/cerrado controlado (opcional). */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Id base (panel y título). Por defecto `cart-popover`. */
  id?: string;
}
