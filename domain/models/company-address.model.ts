import { CompanyAddressType } from "@/domain/types";

/** Tipo de sede → texto del Figma ("¿Qué tipo de sede es?", onboarding `3392:2924`). */
export const COMPANY_ADDRESS_TYPE_LABELS: Record<CompanyAddressType, string> = {
  OFFICE: "Oficina",
  WAREHOUSE: "Depósito",
  OTHER: "Otro",
};

/** Orden de los chips, igual que el Figma. */
export const COMPANY_ADDRESS_TYPE_OPTIONS: readonly CompanyAddressType[] = ["OFFICE", "WAREHOUSE", "OTHER"];
