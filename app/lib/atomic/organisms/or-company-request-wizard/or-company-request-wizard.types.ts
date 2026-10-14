import { ReactNode } from "react";

import { CreateCompanyRequest } from "@/domain/types";

/** Campos del contrato `POST /company-requests`: es la clave con la que se reportan los errores. */
export type CompanyRequestField = keyof CreateCompanyRequest;

/**
 * Error que el `onSubmit` de la página lanza (rechaza) para que el asistente lo muestre.
 * Con `field`, el error se pinta en ese campo y el asistente vuelve a su paso
 * (p. ej. el 409 del RIF en el paso 1); sin él, se muestra como alerta en el paso 3.
 */
export interface OrCompanyRequestWizardSubmitError {
  message: string;
  field?: CompanyRequestField;
}

export interface OrCompanyRequestWizardProps {
  /**
   * Recibe el payload ya validado y normalizado según el contrato: RIF como `J-12345678-9`,
   * teléfono como `+58 412 000 0000`, `employeeCount` numérico (límite inferior del rango) y
   * opcionales omitidos si van vacíos. La casilla de términos no se envía.
   * Debe rechazar con `OrCompanyRequestWizardSubmitError`.
   */
  onSubmit: (data: CreateCompanyRequest) => Promise<void>;
  isSubmitting?: boolean;
  /** Contenido bajo el asistente (p. ej. el enlace al login). */
  footer?: ReactNode;
}
