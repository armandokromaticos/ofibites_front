import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pickActiveCompanyId } from "@/domain/models/auth.model";
import { authService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { LoginRequest, MeResponse } from "@/domain/types";
import { ApiError } from "@/shared/types";
import { isApiError } from "@/shared/utils";
import { tokenManager } from "@/shared/utils/storage";

import { ME_QUERY_KEY } from "./useMe";

const ME_FAILED_MESSAGE = "Tus datos de acceso son correctos, pero no pudimos cargar tu cuenta. Inténtalo de nuevo.";
const NO_COMPANY_MESSAGE = "Aún no tienes acceso a una empresa. Contacta al administrador de tu empresa.";

/**
 * Error de `/auth/me` tras un login correcto. Red, timeout y 5xx se dejan tal cual (mensaje genérico
 * de `getApiErrorMessage`); un 4xx ("Token inválido", "Usuario no autenticado") no tiene sentido en el
 * login y se sustituye por un mensaje propio.
 */
function toMeError(error: unknown): unknown {
  if (!isApiError(error) || error.statusCode === 408 || error.statusCode >= 500) return error;
  const meError: ApiError = { statusCode: error.statusCode, message: ME_FAILED_MESSAGE };
  return meError;
}

/**
 * Login completo: `POST /auth/login` y después `GET /auth/me` (memberships y empresa activa).
 * La sesión solo se marca cuando las dos responden: si `/auth/me` falla, se borran los tokens y el
 * error llega a la página como cualquier error del login. Nunca queda una sesión a medias.
 */
export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<MeResponse> => {
      const auth = await authService.login(data);
      // Sin restos de una sesión anterior: ni datos de otro usuario en la caché ni su empresa activa
      // en el `X-Company-Id` de `getMe`.
      logout();
      // removeQueries y no clear(): clear() también vaciaría la caché de mutaciones, con esta en curso.
      queryClient.removeQueries();
      // `getMe` usa `authFetcher`, que lee el token de `tokenManager`.
      tokenManager.setTokens(auth.accessToken, auth.refreshToken);

      let me: MeResponse;
      try {
        me = await authService.getMe();
      } catch (error) {
        logout();
        throw toMeError(error);
      }

      // El back ya exige a un CLIENT una membership activa en una empresa activa: es solo una defensa.
      if (me.user.role === "CLIENT" && !pickActiveCompanyId(me.memberships)) {
        logout();
        const error: ApiError = { statusCode: 401, message: NO_COMPANY_MESSAGE };
        throw error;
      }

      setSession({ accessToken: auth.accessToken, refreshToken: auth.refreshToken, me });
      queryClient.setQueryData(ME_QUERY_KEY, me);
      return me;
    },
  });
}
