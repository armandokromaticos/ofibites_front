import { ReactNode } from "react";

import { AtStatusChipTone } from "@/ui/atomic/atoms";

export interface OrDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Nombre del archivo ("comprobante-pago-001243.jpg", "factura-F-2026-0007.pdf"): título del visor. */
  title: string;
  /** "Pedido #001243 · subido por María Gabriela Pérez el 26/09". */
  subtitle?: string;
  /** Chip del estado ("Validado", "A crédito"). */
  status?: { label: string; tone: AtStatusChipTone };
  /** `image`: zoom propio (botones, rueda y arrastre). `pdf`: visor del navegador en un `iframe`. */
  kind: "image" | "pdf";
  /** `blob:` URL del archivo (la crea quien lo descarga con sesión). `null` mientras carga o si falló. */
  url: string | null;
  isLoading?: boolean;
  /** Mensaje si no se pudo cargar el archivo. */
  error?: string | null;
  onRetry?: () => void;
  onDownload?: () => void;
  isDownloading?: boolean;
  /** Nombre accesible del documento (`alt` de la imagen o `title` del iframe). Por defecto, `title`. */
  documentLabel?: string;
  /** Contenido extra bajo el visor (p. ej. un aviso de descarga fallida). */
  footer?: ReactNode;
}
