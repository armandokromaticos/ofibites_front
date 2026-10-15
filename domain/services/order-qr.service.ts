import { tokenManager } from "@/shared/utils/storage";

/** Respuesta del Route Handler `GET /api/orders/validate` (`app/api/orders/validate/route.ts`). */
export interface OrderQrValidation {
  valid: boolean;
  message?: string;
  orderId?: string;
  status?: string;
}

const VALIDATION_TIMEOUT_MS = 15_000;

/** Error con un mensaje que se puede mostrar al usuario. */
function getValidationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("failed to fetch")) {
      return "No se pudo conectar con la validación. Verifica que el frontend responda en /api/orders/validate y que el backend esté activo.";
    }

    if (error.name === "AbortError") {
      return "La validación tardó demasiado. Intenta de nuevo y revisa la conexión del servidor.";
    }

    return error.message;
  }

  return "No se pudo leer o validar el QR.";
}

async function requestValidation(shortCode: string): Promise<OrderQrValidation> {
  // Va al Route Handler del propio front (mismo origen), no directo a la API.
  const apiUrl =
    typeof window === "undefined"
      ? `/api/orders/validate?shortCode=${encodeURIComponent(shortCode)}`
      : `${window.location.origin}/api/orders/validate?shortCode=${encodeURIComponent(shortCode)}`;

  const token = tokenManager.getAccessToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS);

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  const body = (await response.json().catch(() => ({}))) as OrderQrValidation;

  if (!response.ok) {
    throw new Error(body.message ?? "No se pudo validar la orden.");
  }

  return body;
}

export const orderQrService = {
  /** Valida una orden por su `shortCode`. Si falla, lanza un `Error` con un mensaje para el usuario. */
  validateShortCode: async (shortCode: string): Promise<OrderQrValidation> => {
    try {
      return await requestValidation(shortCode);
    } catch (error) {
      throw new Error(getValidationErrorMessage(error));
    }
  },
};
