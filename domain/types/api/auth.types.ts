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

/**
 * `UserResponseDto`. Las fechas llegan como string ISO; `birthDate` es fecha pura (`AAAA-MM-DD`).
 * `passwordChangedAt` (T-30a): último cambio de contraseña (cambio desde el perfil o restablecimiento); `null` si
 * nunca la cambió desde que existe la columna. Viene en todo `UserResponseDto` (login, `/auth/me`, `/users`).
 */
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
  passwordChangedAt: string | null;
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

/** `ForgotPasswordDto` (`POST /auth/forgot-password`, público). Responde 204 exista o no el correo. */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * `ResetPasswordDto` (`POST /auth/reset-password`, público). `accessToken` es el de la sesión de
 * recuperación que Supabase deja en el hash de `/reset-password`. Responde 204.
 */
export interface ResetPasswordRequest {
  accessToken: string;
  password: string;
}

/**
 * `PATCH /auth/me` (T-30a): el usuario edita sus propios datos. Todos opcionales, al menos uno. `name` es el
 * nombre completo (Nombre + Apellido unidos con un espacio). `phone`/`position` con `null` se borran.
 * `position` vive en la membresía de la empresa activa: exige `X-Company-Id` (lo pone `authFetcher`).
 * Responde un `MeResponse` ya actualizado.
 */
export interface UpdateMeRequest {
  name?: string;
  phone?: string | null;
  position?: string | null;
}

/**
 * `POST /auth/change-password` (T-30a). Responde 204. Contraseña actual incorrecta → 400 (no 401) con
 * "La contraseña actual no es correcta". Cierra las demás sesiones; la actual sigue válida.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
