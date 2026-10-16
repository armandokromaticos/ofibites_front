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
  createdAt: string;
  updatedAt: string;
}
