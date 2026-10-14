/** `POST /api/company-requests` (público). Ver gestion/CONTRATOS-API.md. */
export interface CreateCompanyRequest {
  /** Razón social. Máx. 200. */
  legalName: string;
  /** RIF. Máx. 50. */
  taxId: string;
  /** Máx. 150. */
  contactName: string;
  /** Email válido. Máx. 150. */
  contactEmail: string;
  /** Máx. 50. */
  contactPhone: string;
  /** Cargo. Opcional, máx. 100. */
  position?: string;
  /** Entero de 1 a 1.000.000. Opcional. Se envía como número, nunca como string. */
  employeeCount?: number;
}

export type CompanyRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CompanyRequestResponse {
  id: string;
  legalName: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  position: string | null;
  employeeCount: number | null;
  status: CompanyRequestStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  approvedCompanyId: string | null;
  createdAt: string;
  updatedAt: string;
}
