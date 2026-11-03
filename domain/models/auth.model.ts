import { Membership, UserRole } from "@/domain/types";

// Se importa por ruta (`@/domain/models/auth.model`) y no desde el barrel para no chocar con el PR 6,
// que reescribe `domain/models/index.ts`. Al mergear ambos se puede añadir al barrel.

/** Etiquetas en español de los roles de plataforma. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Superadministrador",
  OPS_ADMIN: "Administrador de operaciones",
  FINANCE_ADMIN: "Administrador de finanzas",
  KAM: "Gestor de cuentas (KAM)",
  OPERATOR: "Operador",
  CLIENT: "Cliente",
};

/** Roles del equipo Ofibites (todo menos `CLIENT`): son los que entran a `/admin`. */
export const PLATFORM_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OPS_ADMIN", "FINANCE_ADMIN", "KAM", "OPERATOR"];

export const CLIENT_ROLES: readonly UserRole[] = ["CLIENT"];

export function isPlatformRole(role: UserRole): boolean {
  return PLATFORM_ROLES.includes(role);
}

/** Ruta del onboarding de la empresa (T-34). */
export const RUTA_ONBOARDING = "/onboarding";

/**
 * T-34: el `COMPANY_ADMIN` de una empresa sin onboarding (`onboardingCompletedAt === null`) debe configurarla
 * antes de usar la app. `undefined` (sesión guardada antes de T-34, o back sin el campo) no cuenta como pendiente.
 */
export function needsOnboarding(memberships: Membership[], activeCompanyId: string | null): boolean {
  const membership = memberships.find((item) => item.companyId === activeCompanyId);
  return membership?.role === "COMPANY_ADMIN" && membership.onboardingCompletedAt === null;
}

/** Dónde aterriza cada rol tras el login. El admin de plataforma aún no tiene inicio propio: "/". */
export function getHomePath(role: UserRole): string {
  return role === "CLIENT" ? "/dashboard" : "/";
}

/** Inicio tras el login con la sesión completa: el onboarding pendiente manda sobre el inicio del rol (T-34). */
export function getPostLoginPath(
  role: UserRole,
  memberships: Membership[],
  activeCompanyId: string | null = null,
): string {
  if (role === "CLIENT" && needsOnboarding(memberships, pickActiveCompanyId(memberships, activeCompanyId))) {
    return RUTA_ONBOARDING;
  }
  return getHomePath(role);
}

/** Una membership sirve para operar si ella y su empresa están activas (mismo criterio que el login del back). */
export function isUsableMembership(membership: Membership): boolean {
  return membership.isActive && membership.companyIsActive;
}

/**
 * Empresa activa: se conserva la actual si sigue siendo válida; si no, la primera membership activa
 * de una empresa activa. `null` si no hay ninguna.
 */
export function pickActiveCompanyId(
  memberships: Membership[],
  currentId: string | null = null,
): string | null {
  const usable = memberships.filter(isUsableMembership);
  if (currentId && usable.some((membership) => membership.companyId === currentId)) return currentId;
  return usable[0]?.companyId ?? null;
}
