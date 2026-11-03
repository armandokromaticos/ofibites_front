// Empresa: `GET /api/companies/:id` (CLIENT miembro activo de la empresa; si no, 403). Alineado con
// `CompanyResponseDto` del back (`src/core/application/dto/companies/company-response.dto.ts`).

export interface Company {
  id: string;
  /** Nombre de la empresa (comercial). */
  legalName: string;
  /** RIF. */
  taxId: string;
  email: string | null;
  phone: string | null;
  /** Razón social legal; puede diferir de `legalName`. */
  fiscalName: string | null;
  /** Dirección fiscal completa. */
  fiscalAddress: string | null;
  /** Plazo de crédito en días (0 = contado). */
  creditDays: number;
  isActive: boolean;
  /** T-34a: cuándo se completó el onboarding; `null` si aún no. */
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Body de `PATCH /companies/:companyId/fiscal-data` (T-34a, con `X-Company-Id`): paso 1 del onboarding.
 * Devuelve la `Company` actualizada. Razón social y RIF no se editan (ya los validó Ofibites).
 */
export interface UpdateCompanyFiscalDataRequest {
  /** Dirección fiscal (la del RIF), 1-500. */
  fiscalAddress: string;
  fiscalName?: string | null;
}

/**
 * Respuesta de `POST /companies/:companyId/onboarding/complete` (T-34a). 400 con mensaje en español si falta la
 * dirección fiscal o no hay ninguna sede.
 */
export interface CompleteOnboardingResponse {
  onboardingCompletedAt: string;
}
