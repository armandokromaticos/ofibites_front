// Miembros de la empresa activa: `GET/POST/PATCH /api/companies/:companyId/members[...]` (T-29b).
// `companyId` va en el **path**, no en `X-Company-Id` (distinto del resto de endpoints de empresa).
// Alineado con `CompanyMemberResponseDto` del back (`src/core/application/dto/company-members/company-member-response.dto.ts`).
//
// `name`/`email`/`phone` del `User` asociado (T-29c, cierra el hueco que dejó T-29b): `email` sigue sin poder
// cambiarse por ningún endpoint de `company-members` (decisión de diseño del Figma "Editar usuario").

import { CompanyRole } from "./auth.types";

export interface CompanyMember {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  phone: string | null;
  role: CompanyRole;
  position: string | null;
  branchId: string | null;
  departmentId: string | null;
  canPayInvoices: boolean;
  isActive: boolean;
  /** `null` = invitado que nunca inició sesión ("Pendiente" del Figma). */
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST /companies/:companyId/members/invite` ("Añadir usuario" del Figma). */
export interface InviteCompanyMemberRequest {
  /** Nombre y apellido unidos (`${nombre} ${apellido}`.trim()`): `User.name` es un solo campo. */
  name: string;
  email: string;
  phone?: string;
  position?: string;
  branchId?: string;
  departmentId?: string;
  role: CompanyRole;
  canPayInvoices?: boolean;
}

/**
 * `PATCH /companies/:companyId/members/:id`: "Editar usuario" y también "Desactivar"/"Reactivar"
 * (solo `{ isActive }`). `name`/`phone` (T-29c) actualizan el `User` del miembro si vienen; `email` no se
 * puede cambiar (sin campo en este DTO).
 */
export interface UpdateCompanyMemberRequest {
  /** Nombre y apellido unidos (`${nombre} ${apellido}`.trim()`), igual que `InviteCompanyMemberRequest`. */
  name?: string;
  phone?: string | null;
  role?: CompanyRole;
  position?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  canPayInvoices?: boolean;
  isActive?: boolean;
}

/** `ResendMemberInviteResponseDto` (`POST .../resend-invite`) y, por contrato, la misma forma para reset-password. */
export interface ResendMemberInviteResponse {
  email: string;
  name: string;
  message: string;
}

/**
 * `POST .../reset-password` (T-29a, PROPUESTO al escribir esto — ver CONTRATOS-API). Mismo shape que
 * `ResendMemberInviteResponse` según el contrato acordado.
 */
export type ResetMemberPasswordResponse = ResendMemberInviteResponse;
