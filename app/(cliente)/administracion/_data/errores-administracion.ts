import { getApiErrorMessage, isApiError } from "@/shared/utils";

/**
 * Mensaje de un error de `company-members` (invitar/editar/reenviar/restablecer). Un 404 con el texto de
 * Nest para una ruta inexistente ("Cannot POST ...") significa que el back todavía no sirve el endpoint
 * (p. ej. `reset-password`, T-29a en paralelo): se traduce a un mensaje propio en vez de mostrar inglés.
 */
export function mensajeErrorMiembro(error: unknown, fallback: string): string {
  if (isApiError(error) && error.statusCode === 404 && typeof error.message === "string" && error.message.startsWith("Cannot ")) {
    return "Esta función todavía no está disponible. Inténtalo de nuevo más tarde.";
  }
  return getApiErrorMessage(error, fallback);
}
