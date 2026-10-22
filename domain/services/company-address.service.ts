import {
  CompanyAddress,
  CompanyAddressBlockingOrder,
  CreateCompanyAddressRequest,
  UpdateCompanyAddressRequest,
} from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

const ruta = (companyId: string) => `/companies/${encodeURIComponent(companyId)}/addresses`;
const rutaUno = (companyId: string, id: string) => `${ruta(companyId)}/${encodeURIComponent(id)}`;

export const companyAddressService = {
  /** Direcciones de la empresa. Un CLIENT debe ser miembro activo (si no, 403). */
  list: (companyId: string): Promise<CompanyAddress[]> => authFetcher<CompanyAddress[]>(ruta(companyId)),

  /** `POST /companies/:companyId/addresses`: solo COMPANY_ADMIN de la empresa (o admin de plataforma); si no, 403. */
  create: (companyId: string, body: CreateCompanyAddressRequest): Promise<CompanyAddress> =>
    authFetcher<CompanyAddress>(ruta(companyId), { method: "POST", body: JSON.stringify(body) }),

  /** `PATCH /companies/:companyId/addresses/:id`: solo COMPANY_ADMIN de la empresa (o admin de plataforma). */
  update: (companyId: string, id: string, body: UpdateCompanyAddressRequest): Promise<CompanyAddress> =>
    authFetcher<CompanyAddress>(rutaUno(companyId, id), { method: "PATCH", body: JSON.stringify(body) }),

  /**
   * `DELETE /companies/:companyId/addresses/:id`: solo COMPANY_ADMIN de la empresa (o admin de plataforma).
   * 204 sin cuerpo. El back es el gate real: 409 si la dirección tiene pedidos en curso asociados (FK activo).
   */
  remove: (companyId: string, id: string): Promise<void> =>
    authFetcher<void>(rutaUno(companyId, id), { method: "DELETE" }),

  /**
   * `GET /companies/:companyId/addresses/:id/blocking-orders` (T-31a, IMPLEMENTADO): pedidos en curso que usan
   * esta dirección, para avisar antes de confirmar el borrado. Lista vacía si no hay ninguno.
   */
  blockingOrders: (companyId: string, id: string): Promise<CompanyAddressBlockingOrder[]> =>
    authFetcher<CompanyAddressBlockingOrder[]>(`${rutaUno(companyId, id)}/blocking-orders`),
};
