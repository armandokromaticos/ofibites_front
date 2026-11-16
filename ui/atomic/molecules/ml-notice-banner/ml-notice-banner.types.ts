import { ReactNode, Ref } from "react";

export type MlNoticeBannerTone = "success" | "warning" | "danger" | "credit";

export interface MlNoticeBannerAction {
  label: string;
  onPress?: () => void;
  /** Si se pasa, la acción es un enlace (navega). */
  href?: string;
  /**
   * `bordered`: píldora con borde `primary` ("Ver comprobante"). `danger-bordered`: borde y texto naranja ("Cancelar
   * envío"). `accent`: sólido naranja oscuro ("Subir otro comprobante", "Pagar factura ahora"). `primary`: sólido verde.
   */
  variant?: "primary" | "bordered" | "danger-bordered" | "accent";
  isLoading?: boolean;
  /** Nombre accesible más largo que el texto visible (p. ej. con el número de la factura). */
  ariaLabel?: string;
}

export interface MlNoticeBannerProps {
  tone: MlNoticeBannerTone;
  /** "Finanzas confirmó tu pago". */
  title: ReactNode;
  /** Detalle bajo el título. */
  children?: ReactNode;
  /** Icono del círculo (lucide). Sin él, el del tono. */
  icon?: ReactNode;
  /** Hasta dos acciones a la derecha (abajo en móvil). */
  actions?: MlNoticeBannerAction[];
  /**
   * `tone` (por defecto): el color de título del tono (naranja oscuro en `danger`). `foreground`: título en negro,
   * p. ej. "Finanzas rechazó tu comprobante" (Figma 3628:1608), donde el naranja queda para la factura vencida.
   */
  titleColor?: "tone" | "foreground";
  /** `alert` para un bloqueo que aparece por una acción; por defecto no se anuncia (es estado de la página). */
  role?: "alert" | "status";
  id?: string;
  /** Para enfocar el aviso (p. ej. tras un error que lo hace aparecer). */
  containerRef?: Ref<HTMLDivElement>;
  className?: string;
}
