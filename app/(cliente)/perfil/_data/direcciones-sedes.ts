import { CompanyAddress } from "@/domain/types";

/** "3 sedes activas" / "1 sede activa" / "Ninguna sede todavía" (Figma `3657:2154`/`3659:2400`). */
export function sedesActivasLabel(count: number): string {
  if (count === 0) return "Ninguna sede todavía";
  return `${count} sede${count === 1 ? "" : "s"} activa${count === 1 ? "" : "s"}`;
}

/** Sede principal primero (T-31a, back PENDIENTE: `isPrimary` puede no llegar todavía), luego por nombre. */
export function ordenarSedes(addresses: CompanyAddress[]): CompanyAddress[] {
  return [...addresses].sort((a, b) => {
    const porPrincipal = Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary));
    if (porPrincipal !== 0) return porPrincipal;
    return a.label.localeCompare(b.label, "es");
  });
}
