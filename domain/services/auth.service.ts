import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/domain/types";
import { authFetcher, fetcher } from "@/shared/utils/fetch";

export const authService = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    fetcher<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (
    data: RegisterRequest
  ): Promise<AuthResponse["user"]> =>
    fetcher<AuthResponse["user"]>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (): Promise<void> =>
    authFetcher<void>("/auth/logout", {
      method: "POST",
    }),

  getMe: (): Promise<AuthResponse["user"]> =>
    authFetcher<AuthResponse["user"]>("/auth/me"),
};
