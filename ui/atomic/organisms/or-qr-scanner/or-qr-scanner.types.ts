/** Contenido del QR de una orden (lo que codifica `OrOrderQrCode`). */
export interface OrQrScannerPayload {
  orderId: string;
  shortCode: string;
}

/** Resultado de validar una orden por su `shortCode`. */
export interface OrQrScannerValidation {
  valid: boolean;
  message?: string;
  orderId?: string;
  status?: string;
}

/**
 * Los callbacks no tienen que ser referencias estables: el organismo guarda el último en una ref y la cámara
 * solo arranca una vez por montaje (cambiarlos no la reinicia).
 */
export interface OrQrScannerProps {
  /**
   * Valida la orden leída (la llamada vive fuera del organismo, p. ej. en `domain/services`). Si lanza un
   * `Error`, su mensaje se muestra tal cual.
   */
  onValidate: (shortCode: string) => Promise<OrQrScannerValidation>;
  /** Se llama cuando la orden leída es válida. */
  onScanSuccess?: (payload: OrQrScannerPayload) => void;
}
