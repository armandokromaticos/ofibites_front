import { InvoicePayment, OrderInvoice } from "@/domain/types";
import {
  caracasNow,
  dateOnlyFromApi,
  formatCaracasDateSlash,
  formatCaracasTime,
  formatWallTime,
  getApiErrorMessage,
  isApiError,
  isWallTime,
} from "@/shared/utils";

import { RUTA_CARRITO } from "../../_navegacion";

// Textos de fechas del Figma de pagos ("26/09", "9:40 a. m.", "hoy a las 10:02 a. m."). Los instantes (`submittedAt`,
// `reviewedAt`, `paidAt`, `issuedAt`) van en hora de Caracas; las fechas puras (`dueDate`, `paymentDate`) sin zona.

/** "26/09/2026" de una fecha pura de la API (`dueDate`, `paymentDate`), sin convertir zona. */
export function fechaPura(value: string | null | undefined): string {
  const fecha = dateOnlyFromApi(value);
  if (!fecha) return "—";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** "26/09" de una fecha pura. */
export function diaMesPura(value: string | null | undefined): string {
  return fechaPura(value).slice(0, 5);
}

/** "26/09" de un instante, en hora de Caracas. */
export function diaMes(iso: string): string {
  return formatCaracasDateSlash(iso).slice(0, 5);
}

/** "9:40 a. m." de un instante, en hora de Caracas (el Figma escribe "a. m." / "p. m."). */
export function hora(iso: string): string {
  return formatCaracasTime(iso).replace(/\s?am$/, " a. m.").replace(/\s?pm$/, " p. m.");
}

/** "12:30 p. m." de una hora de pared ("HH:mm", `deliveryTime`), sin convertir zona; `null` si no es válida. */
export function horaPared(value: string | null | undefined): string | null {
  if (!value || !isWallTime(value)) return null;
  return formatWallTime(value).replace(/\s?a\.m\.$/, " a. m.").replace(/\s?p\.m\.$/, " p. m.");
}

/** `true` si el instante cae hoy en Caracas. */
export function esHoy(iso: string, now: Date = new Date()): boolean {
  const hoy = caracasNow(now).date;
  const [dia, mes, anio] = formatCaracasDateSlash(iso).split("/");
  return `${anio}-${mes}-${dia}` === hoy;
}

/** "hoy a las 10:02 a. m." o "el 27/09 a las 10:02 a. m.". */
export function cuando(iso: string, now?: Date): string {
  return esHoy(iso, now) ? `hoy a las ${hora(iso)}` : `el ${diaMes(iso)} a las ${hora(iso)}`;
}

/** "hoy, 10:02 a. m." o "27/09, 10:02 a. m." (filas "Lo subió" / "Lo validó"). */
export function cuandoCorto(iso: string, now?: Date): string {
  return `${esHoy(iso, now) ? "hoy" : diaMes(iso)}, ${hora(iso)}`;
}

/** "En revisión desde hace 3 horas" a partir de `submittedAt`. */
export function desdeHace(iso: string, now: Date = new Date()): string {
  const minutos = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}

/** El último comprobante si sigue contando (un `WITHDRAWN` se trata como si no hubiera comprobante, T-06b). */
export function comprobanteVigente(invoice: OrderInvoice | null | undefined): InvoicePayment | null {
  const ultimo = invoice?.latestPayment ?? null;
  return ultimo && ultimo.status !== "WITHDRAWN" ? ultimo : null;
}

/** `true` si el comprobante es un PDF (vista ampliada en `iframe`); si no, imagen con zoom. */
export function esPdf(mimeType: string): boolean {
  return mimeType.toLowerCase() === "application/pdf";
}

/** Mensaje de un fallo al enviar el comprobante: el del back tal cual, salvo el 413 de multer (en inglés). */
export function mensajeErrorPago(error: unknown): string {
  if (isApiError(error) && error.statusCode === 413) return "El comprobante no puede pesar más de 5 MB";
  if (isApiError(error) && error.statusCode === 403) {
    return "Tu usuario no puede reportar pagos en esta empresa. Pídeselo a un administrador.";
  }
  return getApiErrorMessage(error, "No pudimos enviar el comprobante. Revisa los datos e inténtalo de nuevo.");
}

/** Destinos de "volver" admitidos: lista blanca exacta (un filtro por prefijo deja pasar `/\evil.com` o `/%09/…`). */
const DESTINOS_VOLVER: readonly string[] = [RUTA_CARRITO];

/** Destino de "volver" que llega por la URL: solo uno de la lista blanca; cualquier otro valor se ignora. */
export function rutaVolverSegura(valor: string | null): string | null {
  return valor !== null && DESTINOS_VOLVER.includes(valor) ? valor : null;
}
