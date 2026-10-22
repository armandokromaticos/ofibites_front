import { getApiErrorMessage, getApiErrorMessages, isApiError } from "@/shared/utils";

const GUARDAR_FALLBACK = "No pudimos guardar tus datos. Inténtalo de nuevo.";
const CONTRASENA_FALLBACK = "No pudimos actualizar la contraseña. Inténtalo de nuevo.";
const DEMASIADOS_INTENTOS = "Hiciste demasiados intentos seguidos. Espera unos minutos y vuelve a intentar.";
const SUBIR_FOTO_FALLBACK = "No pudimos guardar tu foto. Inténtalo de nuevo.";
const QUITAR_FOTO_FALLBACK = "No pudimos quitar tu foto. Inténtalo de nuevo.";

/**
 * Mensaje de un error de `PATCH /auth/me`. Los 400 de validación llegan como array de mensajes por campo
 * (p. ej. "name admite como máximo 120 caracteres") y caen en el genérico: el formulario ya valida esos límites.
 */
export function mensajeErrorPerfil(error: unknown): string {
  return getApiErrorMessage(error, GUARDAR_FALLBACK);
}

/**
 * Error de `POST /auth/me/avatar` (T-30c/T-30d). Los 400 de formato/tamaño y el 503 de Storage ya llegan en
 * español desde el back (contrato); no hace falta clasificar por campo, solo mostrarlos.
 */
export function mensajeErrorAvatar(error: unknown): string {
  return getApiErrorMessage(error, SUBIR_FOTO_FALLBACK);
}

/** Error de `DELETE /auth/me/avatar` (T-30c/T-30d). */
export function mensajeErrorQuitarAvatar(error: unknown): string {
  return getApiErrorMessage(error, QUITAR_FOTO_FALLBACK);
}

const GUARDAR_DIRECCION_FALLBACK = "No pudimos guardar la sede. Inténtalo de nuevo.";
const ELIMINAR_DIRECCION_FALLBACK = "No pudimos eliminar la sede. Inténtalo de nuevo.";

/** Error de crear/editar una sede (`POST`/`PATCH .../addresses`). Solo COMPANY_ADMIN puede, de ahí el 403. */
export function mensajeErrorDireccion(error: unknown): string {
  if (isApiError(error) && error.statusCode === 403) {
    return "Solo el administrador de tu empresa puede crear o editar sedes.";
  }
  return getApiErrorMessage(error, GUARDAR_DIRECCION_FALLBACK);
}

/**
 * Error de `DELETE .../addresses/:id`. El 409 es el gate real del back cuando la sede tiene pedidos en curso
 * asociados (T-31a, back PENDIENTE al escribir esto): se muestra tal cual, aunque el chequeo previo del front
 * (si lo hay) no haya avisado nada (pudo cambiar entre que se abrió el modal y se confirmó).
 */
export function mensajeErrorEliminarDireccion(error: unknown): string {
  if (isApiError(error) && error.statusCode === 403) {
    return "Solo el administrador de tu empresa puede eliminar sedes.";
  }
  return getApiErrorMessage(error, ELIMINAR_DIRECCION_FALLBACK);
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
