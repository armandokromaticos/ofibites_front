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
