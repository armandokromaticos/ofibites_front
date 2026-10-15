import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MeResponse,
  ResetPasswordRequest,
} from "@/domain/types";
import { authFetcher, fetcher } from "@/shared/utils/fetch";

export const authService = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    fetcher<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (): Promise<void> =>
    authFetcher<void>("/auth/logout", {
      method: "POST",
    }),

  /** Perfil del usuario y sus empresas. Requiere `Authorization`; `X-Company-Id` no es obligatorio. */
  getMe: (): Promise<MeResponse> => authFetcher<MeResponse>("/auth/me"),

  /** Envía el correo de recuperación. Público (sin token de sesión); 204 siempre, 429 por límite de envío. */
  forgotPassword: (data: ForgotPasswordRequest): Promise<void> =>
    fetcher<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Cambia la contraseña con el token del enlace. Público; 401 si el enlace venció o no es válido. */
  resetPassword: (data: ResetPasswordRequest): Promise<void> =>
    fetcher<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
