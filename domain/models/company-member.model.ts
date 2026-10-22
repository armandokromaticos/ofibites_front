import { CompanyMember, CompanyRole } from "@/domain/types";
import { formatCaracasTime } from "@/shared/utils/date";

/** Rol de empresa → texto del Figma ("Administración de usuarios"). */
export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  COMPANY_ADMIN: "Administrador de empresa",
  COMPANY_BUYER: "Comprador",
  COMPANY_FINANCE: "Financiero",
  COMPANY_APPROVER: "Aprobador",
};

/** Descripción de "¿Qué puede hacer cada rol?" (añadir/editar usuario), texto literal del Figma. */
export const COMPANY_ROLE_DESCRIPTIONS: Record<CompanyRole, string> = {
  COMPANY_ADMIN: "Ve todo, gestiona usuarios y sedes, y aprueba pedidos de monto alto.",
  COMPANY_BUYER: "Arma y confirma pedidos. No gestiona usuarios ni paga facturas.",
  COMPANY_FINANCE: "Paga y concilia facturas. No crea pedidos.",
  COMPANY_APPROVER: "Aprueba o rechaza pedidos que superan el umbral configurado.",
};

/** Orden de los roles en el select y en la tarjeta de ayuda, igual que el Figma. */
export const COMPANY_ROLE_OPTIONS: readonly CompanyRole[] = [
  "COMPANY_ADMIN",
  "COMPANY_BUYER",
  "COMPANY_FINANCE",
  "COMPANY_APPROVER",
];

export type MemberStatus = "active" | "inactive" | "pending";

/** "Pendiente" = invitado que nunca inició sesión (`lastSeenAt === null`), sin importar si está activo. */
export function memberStatus(member: Pick<CompanyMember, "isActive" | "lastSeenAt">): MemberStatus {
  if (!member.isActive) return "inactive";
  if (!member.lastSeenAt) return "pending";
  return "active";
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

/** Color de `AtChip` (HeroUI, `variant="flat"`) para el badge de estado. */
export const MEMBER_STATUS_COLORS: Record<MemberStatus, "success" | "danger" | "warning"> = {
  active: "success",
  inactive: "danger",
  pending: "warning",
};

/** Opciones del filtro "Estado: Todos" de la lista. */
export const MEMBER_STATUS_FILTERS: readonly MemberStatus[] = ["active", "pending", "inactive"];

const CARACAS_TZ = "America/Caracas";

function caracasDateOnly(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CARACAS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Diferencia en días de calendario (hora de Caracas) entre dos instantes: `a` antes de `b` da un número positivo. */
function daysBetweenCaracas(a: Date, b: Date): number {
  const [ay, am, ad] = caracasDateOnly(a).split("-").map(Number);
  const [by, bm, bd] = caracasDateOnly(b).split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/**
 * "Última conexión" del Figma: "Hace 2 horas", "Ayer, 4:12 p.m.", "Hace 3 días", "Hace 1 semana", "Hace 2
 * meses" o "Sin ingresar" (`lastSeenAt` nulo: invitado pendiente). `now` se inyecta para pruebas.
 */
export function formatMemberLastSeen(lastSeenAt: string | null, now: Date = new Date()): string {
  if (!lastSeenAt) return "Sin ingresar";
  const date = new Date(lastSeenAt);
  if (Number.isNaN(date.getTime())) return "Sin ingresar";

  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;

  const dayDiff = daysBetweenCaracas(date, now);
  if (dayDiff === 1) return `Ayer, ${formatCaracasTime(lastSeenAt)}`;
  if (dayDiff < 7) return `Hace ${dayDiff} días`;
  const weeks = Math.floor(dayDiff / 7);
  if (weeks < 5) return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  const months = Math.floor(dayDiff / 30);
  return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
}
