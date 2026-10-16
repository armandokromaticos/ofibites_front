// Direcciones de una empresa: `GET /api/companies/:companyId/addresses` (CLIENT miembro activo de la empresa).
// Alineado con `CompanyAddressResponseDto` del back (`src/core/application/dto/company-addresses/`).

export interface CompanyAddress {
  id: string;
  companyId: string;
  /** Nombre corto ("Oficina principal"). */
  label: string;
  line1: string;
  line2: string | null;
  reference: string | null;
  city: string;
  state: string | null;
  country: string;
  zip: string | null;
  isBilling: boolean;
  isShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Body de `POST /companies/:companyId/addresses` (`CreateCompanyAddressDto`). Solo COMPANY_ADMIN de la empresa (o
 * SUPER_ADMIN / OPS_ADMIN de plataforma); el resto recibe 403.
 */
export interface CreateCompanyAddressRequest {
  /** ≤ 150. */
  label: string;
  /** ≤ 255. */
  line1: string;
  line2?: string;
  /** ≤ 500. */
  reference?: string;
  /** ≤ 150. */
  city: string;
  state?: string;
  /** ≤ 150. */
  country: string;
  zip?: string;
  isBilling?: boolean;
  /** Por defecto `true` en el back. */
  isShipping?: boolean;
}
