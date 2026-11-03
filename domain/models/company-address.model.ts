import { CompanyAddress, CompanyAddressType } from "@/domain/types";

/** Tipo de sede → texto del Figma ("¿Qué tipo de sede es?", onboarding `3392:2924`). */
export const COMPANY_ADDRESS_TYPE_LABELS: Record<CompanyAddressType, string> = {
  OFFICE: "Oficina",
  WAREHOUSE: "Depósito",
  OTHER: "Otro",
};

/** Orden de los chips, igual que el Figma. */
export const COMPANY_ADDRESS_TYPE_OPTIONS: readonly CompanyAddressType[] = ["OFFICE", "WAREHOUSE", "OTHER"];

/** Opciones ya traducidas para los chips de `OrAddressFormModal` (`typeOptions`). */
export const COMPANY_ADDRESS_TYPE_CHOICES = COMPANY_ADDRESS_TYPE_OPTIONS.map((value) => ({
  value,
  label: COMPANY_ADDRESS_TYPE_LABELS[value],
}));

/**
 * Dirección completa de una sede para "Direcciones y sedes" (Figma `3657:2154`): "Línea 1. Ciudad, Estado."
 * (sin Estado si no hay). Usada por `OrAddressCard` (Mi perfil y onboarding).
 */
export function direccionCompleta(address: Pick<CompanyAddress, "line1" | "city" | "state">): string {
  const ciudadEstado = [address.city, address.state].filter(Boolean).join(", ");
  const base = [address.line1, ciudadEstado].filter(Boolean).join(". ");
  return base ? `${base}.` : "";
}

/**
 * "Referencia: ... · Recibe: ... · <teléfono>" de una sede, solo con lo que haya cargado; `null` si no hay
 * nada que mostrar (ni referencia ni contacto). `contactName`/`contactPhone` son de T-31a (back, PENDIENTE).
 */
export function lineaReferenciaContacto(
  address: Pick<CompanyAddress, "reference" | "contactName" | "contactPhone">,
): string | null {
  const partes: string[] = [];
  if (address.reference) partes.push(`Referencia: ${address.reference}`);
  if (address.contactName) partes.push(`Recibe: ${address.contactName}`);
  if (address.contactPhone) partes.push(address.contactPhone);
  return partes.length > 0 ? partes.join(" · ") : null;
}
