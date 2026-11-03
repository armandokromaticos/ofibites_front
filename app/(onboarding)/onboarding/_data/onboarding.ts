import { Company, CompanyAddress, CompanyRole } from "@/domain/types";
import { getApiErrorMessage, isApiError } from "@/shared/utils";

/** Pasos del indicador (Figma: 4 círculos; el 4.º es «Listo»). Solo se leen en lectores de pantalla. */
export const PASOS = ["Datos de tu empresa", "Sedes", "Equipo", "Listo"] as const;

export type Paso = 0 | 1 | 2 | 3;

export const PASO_LISTO: Paso = 3;

/** Textos literales del Figma (`diseno/figma/textos/onboarding.md`). */
export const COPY_PASO: Record<Paso, { title: string; subtitle: string }> = {
  0: {
    title: "Configura los datos de tu empresa",
    subtitle: "Ingresa la información legal necesaria para activar tu cuenta y gestionar tu facturación.",
  },
  1: {
    title: "Directorio de entrega",
    subtitle:
      "Registra cada lugar donde recibes pedidos. Al ordenar solo eliges la sede y ya sabemos a dónde llevarlo.",
  },
  2: {
    title: "Agrega a tu equipo",
    subtitle:
      "Invita a las personas que harán pedidos o administrarán la cuenta. No es necesario agregar a todos ahora.",
  },
  3: {
    title: "¡Tu cuenta está lista!",
    subtitle:
      "¡Configuración completada! Te damos un recorrido rápido para que conozcas cada sección de tu cuenta.",
  },
};

/** Al recargar se retoma según los datos: sin dirección fiscal → 1; sin sedes → 2; si no → 3. */
export function pasoInicial(company: Company, addresses: CompanyAddress[]): Paso {
  if (!company.fiscalAddress?.trim()) return 0;
  if (addresses.length === 0) return 1;
  return 2;
}

/** "1 sede" / "3 sedes". */
export function sedesLabel(count: number): string {
  return `${count} sede${count === 1 ? "" : "s"}`;
}

/** "1 Integrante" / "3 Integrantes" (Figma `3394:2598`). */
export function integrantesLabel(count: number): string {
  return `${count} Integrante${count === 1 ? "" : "s"}`;
}

/** Rol corto de la lista del equipo: el Figma pone «Administrador» (no «Administrador de empresa»). */
export const ROL_CORTO: Record<CompanyRole, string> = {
  COMPANY_ADMIN: "Administrador",
  COMPANY_BUYER: "Comprador",
  COMPANY_FINANCE: "Financiero",
  COMPANY_APPROVER: "Aprobador",
};

export function mensajeErrorDatosFiscales(error: unknown): string {
  return getApiErrorMessage(error, "No pudimos guardar la dirección fiscal. Inténtalo de nuevo.");
}

export function mensajeErrorSede(error: unknown): string {
  if (isApiError(error) && error.statusCode === 403) {
    return "Solo el administrador de tu empresa puede crear o editar sedes.";
  }
  return getApiErrorMessage(error, "No pudimos guardar la sede. Inténtalo de nuevo.");
}

export function mensajeErrorEliminarSede(error: unknown): string {
  return getApiErrorMessage(error, "No pudimos eliminar la sede. Inténtalo de nuevo.");
}

export function mensajeErrorInvitar(error: unknown): string {
  return getApiErrorMessage(error, "No pudimos invitar a esta persona. Inténtalo de nuevo.");
}

/** El 400 de `onboarding/complete` ya llega en español (falta dirección fiscal o sede): se muestra tal cual. */
export function mensajeErrorFinalizar(error: unknown): string {
  return getApiErrorMessage(error, "No pudimos terminar la configuración. Inténtalo de nuevo.");
}
