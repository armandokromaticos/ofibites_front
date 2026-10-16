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

/**
 * Antigüedad de un aviso: "Ahora" (< 1 min), "Hace 12 min", "Hace 2 h" (< 24 h) y, después, la fecha corta en
 * hora de Caracas ("4 de Sep"). `now` se inyecta para pruebas. Con una ISO inválida devuelve "—".
 */
export function formatCaracasRelative(iso: string, now: Date = new Date()): string {
  if (!isValidIso(iso)) return INVALID_DATE_LABEL;
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return formatCaracasShortDate(iso);
}

/** Fecha y hora completas en hora de Caracas ("4 de Sep, 10:30 am"), p. ej. para el `title` de un `<time>`. */
export function formatCaracasDateTime(iso: string): string {
  if (!isValidIso(iso)) return INVALID_DATE_LABEL;
  return `${formatCaracasShortDate(iso)}, ${formatCaracasTime(iso)}`;
}
