export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export type UserRole =
  | "USER"
  | "ADMIN"
  | "STAND_OPERATOR"
  | "CATALOG_MANAGER";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
