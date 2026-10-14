/** Negocio en hora de Caracas (UTC-4 fijo): ver conocimiento/reglas-negocio.md → Fechas. */
const CARACAS_TIME_ZONE = "America/Caracas";

/** Lo que se pinta si la fecha no se puede leer. */
const INVALID_DATE_LABEL = "—";

const SHORT_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function isValidIso(iso: string): boolean {
  return !Number.isNaN(new Date(iso).getTime());
}

function getCaracasParts(iso: string, options: Intl.DateTimeFormatOptions) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: CARACAS_TIME_ZONE, ...options }).formatToParts(
    new Date(iso),
  );
  return (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
}

/**
 * Fecha corta del Figma en hora de Caracas: "4 de Sep".
 * Con una ISO inválida devuelve "—". Solo para instantes (timestamps). Una fecha `@db.Date` se muestra sin convertir zona.
 */
export function formatCaracasShortDate(iso: string): string {
  if (!isValidIso(iso)) return INVALID_DATE_LABEL;
  const part = getCaracasParts(iso, { day: "numeric", month: "numeric" });
  return `${Number(part("day"))} de ${SHORT_MONTHS[Number(part("month")) - 1]}`;
}

/** Hora del Figma en hora de Caracas: "10:30 am". Con una ISO inválida devuelve "—". */
export function formatCaracasTime(iso: string): string {
  if (!isValidIso(iso)) return INVALID_DATE_LABEL;
  const part = getCaracasParts(iso, { hour: "numeric", minute: "2-digit", hour12: true });
  return `${part("hour")}:${part("minute")} ${part("dayPeriod").toLowerCase()}`;
}
