/**
 * Helpers de presentación de "Indicadores" de Mi perfil (T-32b): etiquetas de mes y el aviso de "Pico: ..."
 * del gráfico "Pedidos por día". Sin datos de ejemplo (T-32a ya está `IMPLEMENTADO`): los números reales
 * salen de `domain/hooks/dashboard/useClientIndicators`/`useConsumptionBreakdown`.
 */

const MONTH_NAMES = [
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

const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseMonth(month: string): { year: number; monthIndex1: number } {
  const [year, monthIndex1] = month.split("-").map(Number);
  return { year, monthIndex1 };
}

function weekdayName(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

/** "Septiembre 2026". */
export function monthLabel(month: string): string {
  const { year, monthIndex1 } = parseMonth(month);
  return `${capitalize(MONTH_NAMES[monthIndex1 - 1])} ${year}`;
}

/** "agosto" (mes anterior al dado, en minúscula, para "vs. agosto"). */
export function previousMonthLabel(month: string): string {
  const { year, monthIndex1 } = parseMonth(month);
  const date = new Date(Date.UTC(year, monthIndex1 - 2, 1));
  return MONTH_NAMES[date.getUTCMonth()];
}

/** El mes actual y `count - 1` meses hacia atrás, el más reciente primero. */
export function monthOptions(count = 12): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: monthLabel(value) });
  }
  return options;
}

/** Día con más pedidos de la serie, para la anotación "Pico: martes 9 · 14 pedidos". `null` si está vacía. */
export function peakOrdersDayLabel(points: { date: string; count: number }[]): string | null {
  if (points.length === 0) return null;
  const peak = points.reduce((max, point) => (point.count > max.count ? point : max), points[0]);
  if (peak.count === 0) return null;
  const day = Number(peak.date.slice(-2));
  return `Pico: ${weekdayName(peak.date)} ${day} · ${peak.count} pedido${peak.count === 1 ? "" : "s"}`;
}
