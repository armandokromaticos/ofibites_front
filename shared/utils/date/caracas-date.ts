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

// --- Fechas puras (`@db.Date`, "YYYY-MM-DD") y horas de pared ("HH:mm") ---------------------------------------
// No llevan zona: se leen y se pintan tal cual. Solo `caracasToday` mira el reloj, en hora de Caracas.

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const WALL_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const LONG_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Fecha y hora de pared de Caracas en este instante: `{ date: "2026-10-16", minutes: 905 }` (15:05 → 905). */
export function caracasNow(now: Date = new Date()): { date: string; minutes: number } {
  const part = getCaracasParts(now.toISOString(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

/** `true` si es una fecha pura válida "YYYY-MM-DD" (sin 31 de febrero). */
export function isDateOnly(value: string): boolean {
  const match = DATE_ONLY.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toISOString().slice(0, 10) === value;
}

/** Suma (o resta) días a una fecha pura, sin zona: `addDaysToDateOnly("2026-10-31", 1)` → `"2026-11-01"`. */
export function addDaysToDateOnly(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/**
 * Fecha pura de una columna `@db.Date` tal como la manda la API (`"2026-10-16T00:00:00.000Z"` o `"2026-10-16"`):
 * los diez primeros caracteres, sin convertir zona (si se convirtiera, en Caracas se correría un día).
 */
export function dateOnlyFromApi(value: string | null | undefined): string | null {
  const date = value?.slice(0, 10) ?? "";
  return isDateOnly(date) ? date : null;
}

/** Fecha pura larga del checkout: "Jueves 26 de septiembre". Con una fecha inválida devuelve "—". */
export function formatDateOnlyLong(date: string): string {
  if (!isDateOnly(date)) return INVALID_DATE_LABEL;
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} de ${LONG_MONTHS[month - 1]}`;
}

/** `true` si es una hora de pared válida "HH:mm" (00:00-23:59). */
export function isWallTime(value: string): boolean {
  return WALL_TIME.test(value);
}

/**
 * Hora de pared del checkout (Figma 3462:2094): "8:00 a.m.", "12:00 m." (mediodía), "1:30 p.m.". Es la hora de
 * Caracas tal como se guardó, sin convertir. Con un valor inválido devuelve "—".
 */
export function formatWallTime(time: string): string {
  const match = WALL_TIME.exec(time);
  if (!match) return INVALID_DATE_LABEL;
  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours === 12 && minutes === "00") return "12:00 m.";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${hours < 12 ? "a.m." : "p.m."}`;
}
