import { Branch } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

const ruta = (companyId: string) => `/companies/${encodeURIComponent(companyId)}/branches`;

export const branchService = {
  /** Sedes de la empresa. Un CLIENT debe ser miembro activo (si no, 403). */
  list: (companyId: string): Promise<Branch[]> => authFetcher<Branch[]>(ruta(companyId)),
};
