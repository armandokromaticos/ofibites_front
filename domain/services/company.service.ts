import { Company, CompleteOnboardingResponse, UpdateCompanyFiscalDataRequest } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

const ruta = (companyId: string) => `/companies/${encodeURIComponent(companyId)}`;

export const companyService = {
  /** `GET /companies/:id`: datos de la empresa (razón social, RIF, dirección fiscal). CLIENT: miembro activo o 403. */
  get: (companyId: string): Promise<Company> => authFetcher<Company>(ruta(companyId)),

  /**
   * `PATCH /companies/:companyId/fiscal-data` (T-34a, paso 1 del onboarding): guarda la dirección fiscal.
   * `authFetcher` añade `X-Company-Id` con la empresa activa.
   */
  updateFiscalData: (companyId: string, body: UpdateCompanyFiscalDataRequest): Promise<Company> =>
    authFetcher<Company>(`${ruta(companyId)}/fiscal-data`, { method: "PATCH", body: JSON.stringify(body) }),

  /**
   * `POST /companies/:companyId/onboarding/complete` (T-34a): marca la empresa como configurada. 400 (mensaje en
   * español) si falta la dirección fiscal o no hay ninguna sede.
   */
  completeOnboarding: (companyId: string): Promise<CompleteOnboardingResponse> =>
    authFetcher<CompleteOnboardingResponse>(`${ruta(companyId)}/onboarding/complete`, { method: "POST" }),
};
