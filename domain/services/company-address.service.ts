import { CompanyAddress } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

export const companyAddressService = {
  /** Direcciones de la empresa. Un CLIENT debe ser miembro activo (si no, 403). */
  list: (companyId: string): Promise<CompanyAddress[]> =>
    authFetcher<CompanyAddress[]>(`/companies/${encodeURIComponent(companyId)}/addresses`),
};
