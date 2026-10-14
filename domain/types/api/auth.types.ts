// Alineado con `ofibites/src/core/application/dto/auth/*` y `dto/users/user-response.dto.ts`.

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Rol de plataforma (`Role` del back). Se toma del enum de `prisma/schema.prisma`, que es lo que
 * devuelve la BD: el enum TS del back (`domain/enums/role.enum.ts`) aún no tiene `FINANCE_ADMIN` ni `KAM`.
 */
export type UserRole =
  | "SUPER_ADMIN"
  | "OPS_ADMIN"
  | "FINANCE_ADMIN"
  | "KAM"
  | "OPERATOR"
  | "CLIENT";

/** Rol funcional dentro de una empresa (`CompanyRole` del back). */
export type CompanyRole =
  | "COMPANY_ADMIN"
  | "COMPANY_BUYER"
  | "COMPANY_FINANCE"
  | "COMPANY_APPROVER";

/** `UserResponseDto`. Las fechas llegan como string ISO; `birthDate` es fecha pura (`AAAA-MM-DD`). */
export interface User {
  id: string;
  authId: string | null;
  email: string;
  name: string;
  phone: string | null;
  birthDate: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** `AuthResponseDto`: respuesta de `POST /auth/login` y `POST /auth/refresh`. */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** `MembershipDto`: pertenencia del usuario a una empresa. */
export interface Membership {
  companyId: string;
  companyName: string;
  companyIsActive: boolean;
  role: CompanyRole;
  position: string | null;
  branchId: string | null;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  canPayInvoices: boolean;
  isActive: boolean;
}

/** `MeResponseDto`: respuesta de `GET /auth/me`. */
export interface MeResponse {
  user: User;
  memberships: Membership[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/** `POST /auth/refresh` devuelve un `AuthResponseDto` completo. */
export type RefreshTokenResponse = AuthResponse;
