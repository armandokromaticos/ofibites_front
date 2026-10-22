import { getApiErrorMessage, getApiErrorMessages, isApiError } from "@/shared/utils";

const GUARDAR_FALLBACK = "No pudimos guardar tus datos. Inténtalo de nuevo.";
const CONTRASENA_FALLBACK = "No pudimos actualizar la contraseña. Inténtalo de nuevo.";
const DEMASIADOS_INTENTOS = "Hiciste demasiados intentos seguidos. Espera unos minutos y vuelve a intentar.";

/**
 * Mensaje de un error de `PATCH /auth/me`. Los 400 de validación llegan como array de mensajes por campo
 * (p. ej. "name admite como máximo 120 caracteres") y caen en el genérico: el formulario ya valida esos límites.
 */
export function mensajeErrorPerfil(error: unknown): string {
  return getApiErrorMessage(error, GUARDAR_FALLBACK);
}

/** Error de `POST /auth/change-password`, clasificado por dónde se muestra. */
export type ErrorCambioContrasena =
  | { tipo: "actual-incorrecta"; mensaje: string }
  | { tipo: "actual"; mensaje: string }
  | { tipo: "nueva"; mensaje: string }
  | { tipo: "formulario"; mensaje: string };

/**
 * Contrato IMPLEMENTADO (T-30a). `message` llega como string (negocio) o como array (validación); se normaliza con
 * `getApiErrorMessages` y se busca por palabras, no por igualdad:
 * - "La contraseña actual no es correcta" → modal de error y el campo marcado.
 * - "La nueva contraseña debe ser distinta de la actual", la política ("La contraseña debe…", "no puede contener
 *   espacios") y "demasiado débil" (Supabase) → en el campo de la nueva.
 * - Validación de `currentPassword` ("La contraseña actual …") → en su campo (se comprueba antes que la nueva).
 * - 429 (throttle o límite de Supabase), 503 (Supabase no responde), red y el resto → aviso del formulario, sin
 *   cerrar la sesión.
 */
export function clasificarErrorContrasena(error: unknown): ErrorCambioContrasena {
  if (isApiError(error) && error.statusCode === 429) return { tipo: "formulario", mensaje: DEMASIADOS_INTENTOS };
  if (isApiError(error) && error.statusCode === 400) {
    const mensajes = getApiErrorMessages(error);
    const actual = mensajes.find((m) => /actual/i.test(m) && /(correcta|incorrecta)/i.test(m));
    if (actual) return { tipo: "actual-incorrecta", mensaje: "La contraseña actual no es correcta." };
    // Validación de `currentPassword` ("La contraseña actual es obligatoria", "... admite como máximo 72"): antes que
    // la regla de la nueva, que también empieza por "La contraseña".
    const actualValidacion = mensajes.find((m) => /^La contraseña actual/i.test(m));
    if (actualValidacion) return { tipo: "actual", mensaje: actualValidacion };
    const nueva = mensajes.find((m) => /(distinta|igual|débil)/i.test(m) || /^La contraseña /.test(m));
    if (nueva) return { tipo: "nueva", mensaje: nueva };
  }
  return { tipo: "formulario", mensaje: getApiErrorMessage(error, CONTRASENA_FALLBACK) };
}
