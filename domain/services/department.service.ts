import { Department } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

const ruta = (companyId: string) => `/companies/${encodeURIComponent(companyId)}/departments`;

export const departmentService = {
  /** Departamentos de la empresa. Un CLIENT debe ser miembro activo (si no, 403). */
  list: (companyId: string): Promise<Department[]> => authFetcher<Department[]>(ruta(companyId)),
};
