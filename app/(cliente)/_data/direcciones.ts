import { CompanyAddress } from "@/domain/types";

/** Sede de la agenda en una línea: "Av. El Bosque, Chacaíto · Caracas". */
export function lineaDireccion(address: CompanyAddress): string {
  return [[address.line1, address.line2].filter(Boolean).join(", "), address.city].filter(Boolean).join(" · ");
}
