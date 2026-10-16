import { CompanyAddress, CreateCompanyAddressRequest } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

const ruta = (companyId: string) => `/companies/${encodeURIComponent(companyId)}/addresses`;

export const companyAddressService = {
  /** Direcciones de la empresa. Un CLIENT debe ser miembro activo (si no, 403). */
  list: (companyId: string): Promise<CompanyAddress[]> => authFetcher<CompanyAddress[]>(ruta(companyId)),

  /** `POST /companies/:companyId/addresses`: solo COMPANY_ADMIN de la empresa (o admin de plataforma); si no, 403. */
  create: (companyId: string, body: CreateCompanyAddressRequest): Promise<CompanyAddress> =>
    authFetcher<CompanyAddress>(ruta(companyId), { method: "POST", body: JSON.stringify(body) }),
};
