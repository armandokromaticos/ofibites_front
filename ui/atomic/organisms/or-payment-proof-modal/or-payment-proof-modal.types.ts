import { ReactNode } from "react";

import { AtStatusChipTone } from "@/ui/atomic/atoms";

export interface OrPaymentProofModalRow {
  label: string;
  value: string;
  /** `amount`: importe grande (primera fila, "Monto pagado"). `danger`: importe declarado que no cuadra. */
  emphasis?: "amount" | "danger";
}

export interface OrPaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chip junto al título ("Validado", "En revisión", "Rechazado"). */
  status: { label: string; tone: AtStatusChipTone };
  /** "Pedido #001243 · Factura F-001243". */
  subtitle: string;
  file: {
    /** `proof.fileName`. */
    name: string;
    /** "1,2 MB · subido el 26/09". */
    metaLabel: string;
    kind: "image" | "pdf";
    /** `blob:` URL para la miniatura (solo imágenes); `null` mientras carga. */
    previewUrl: string | null;
    isLoading?: boolean;
    /** No se pudo cargar la miniatura (el resto del modal sigue útil). */
    hasError?: boolean;
  };
  /** Monto, método, fecha, referencia, quién lo subió, quién lo revisó o desde cuándo está en revisión. */
  rows: OrPaymentProofModalRow[];
  /** Nota al pie del contenido ("La factura quedó marcada como pagada…", "Motivo del rechazo: …"). */
  note?: { tone: "success" | "warning" | "danger"; content: ReactNode };
  onExpand: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
  /** Acción principal ("Descargar factura", "Enviar otro comprobante", "Subir otro comprobante"). */
  primaryAction?: { label: string; onPress: () => void; tone?: "primary" | "accent"; isLoading?: boolean };
  /** Acción destructiva a la izquierda ("Cancelar envío"). */
  dangerAction?: { label: string; onPress: () => void; isLoading?: boolean };
  /** Error de la última acción (descarga, cancelar envío). */
  error?: string | null;
}
