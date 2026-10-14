import { AuthResponse, LoginRequest, MeResponse } from "@/domain/types";
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
};
