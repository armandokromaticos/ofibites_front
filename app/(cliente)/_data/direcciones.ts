import { CompanyAddress } from "@/domain/types";

/** Sede de la agenda en una línea: "Av. El Bosque, Chacaíto · Caracas". */
export function lineaDireccion(address: CompanyAddress): string {
  return [[address.line1, address.line2].filter(Boolean).join(", "), address.city].filter(Boolean).join(" · ");
}

/**
 * Dirección completa de una sede para "Direcciones y sedes" (Figma `3657:2154`): "Línea 1. Ciudad, Estado."
 * (sin Estado si no hay). Usada por `OrAddressCard`.
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
