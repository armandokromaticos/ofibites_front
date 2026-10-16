import { Company } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

export const companyService = {
  /** `GET /companies/:id`: datos de la empresa (razón social, RIF, dirección fiscal). CLIENT: miembro activo o 403. */
  get: (companyId: string): Promise<Company> => authFetcher<Company>(`/companies/${encodeURIComponent(companyId)}`),
};
