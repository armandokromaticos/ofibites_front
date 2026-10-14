import { ApiError } from "@/shared/types";

/** Los errores que lanzan `fetcher`/`authFetcher` son objetos `ApiError`, no instancias de `Error`. */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as ApiError).statusCode === "number"
  );
}

/** Mensajes del error como lista (los 400 de class-validator traen un array). */
export function getApiErrorMessages(error: ApiError): string[] {
  const { message } = error;
  const list = Array.isArray(message) ? message : [message];
  return list.filter((part) => typeof part === "string" && part.trim() !== "");
}

const NETWORK_MESSAGE = "No pudimos conectar con Ofibites. Revisa tu conexión e inténtalo de nuevo.";

/**
 * Mensaje legible en español de un error de la API.
 * - Red (`TypeError` de fetch), 408 (timeout del fetcher) y 5xx: mensaje genérico, nunca el texto del servidor.
 * - 400 con array de class-validator (en inglés): `fallback`. Quien pueda, que lo mapee por campo antes.
 * - Resto (401, 403, 404, 409, 400 con mensaje propio del back, que va en español): el mensaje tal cual.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof TypeError) return NETWORK_MESSAGE;
  if (!isApiError(error)) return fallback;

  if (error.statusCode === 408) return NETWORK_MESSAGE;
  if (error.statusCode >= 500) return fallback;
  if (Array.isArray(error.message)) return fallback;

  const [message] = getApiErrorMessages(error);
  return message ?? fallback;
}
