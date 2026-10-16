import { API_BASE_URL } from "@/shared/constants";
import { ApiError } from "@/shared/types";
import { tokenManager } from "@/shared/utils/storage";

import { getActiveCompanyId, notifySessionExpired } from "./auth-session";

const TIMEOUT_MS = 30_000;

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function parseErrorResponse(
  response: Response
): Promise<ApiError> {
  try {
    const body = await response.json();
    return {
      statusCode: response.status,
      message:
        body.message ?? body.error ?? response.statusText,
      error: body.error,
      body,
    };
  } catch {
    return {
      statusCode: response.status,
      message: response.statusText,
    };
  }
}

function mergeHeaders(
  base: Record<string, string>,
  incoming: HeadersInit | undefined
): void {
  if (!incoming) return;

  if (incoming instanceof Headers) {
    incoming.forEach((value, key) => {
      base[key] = value;
    });
  } else if (Array.isArray(incoming)) {
    for (const [key, value] of incoming) {
      base[key] = value;
    }
  } else {
    Object.assign(base, incoming);
  }
}

const REFRESH_TIMEOUT_MS = 10_000;

type RefreshResult =
  | { status: "ok" }
  /** `/auth/refresh` rechazó el refresh token (400/401) o no hay: la sesión terminó. */
  | { status: "rejected" }
  /** Red, timeout o 5xx: la sesión puede seguir siendo válida, no se toca. */
  | { status: "error"; error: unknown };

/** Otra pestaña (o petición) ya cambió el access token que falló: no hace falta refrescar. */
function wasRefreshedElsewhere(failedToken: string | null): boolean {
  tokenManager.syncFromStorage();
  const current = tokenManager.getAccessToken();
  return Boolean(current) && current !== failedToken;
}

async function requestTokenRefresh(failedToken: string | null): Promise<RefreshResult> {
  // Desde localStorage y no de memoria: otra pestaña puede haber rotado ya el refresh token.
  if (wasRefreshedElsewhere(failedToken)) return { status: "ok" };
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return { status: "rejected" };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REFRESH_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      }
    );

    if (response.status === 400 || response.status === 401) {
      // Sin Web Locks, otra pestaña pudo rotar el token a la vez: si dejó uno nuevo, se usa ese.
      tokenManager.syncFromStorage();
      const latest = tokenManager.getRefreshToken();
      return latest && latest !== refreshToken ? { status: "ok" } : { status: "rejected" };
    }
    if (!response.ok) return { status: "error", error: await parseErrorResponse(response) };

    const data = await response.json();
    tokenManager.setTokens(
      data.accessToken,
      data.refreshToken
    );
    return { status: "ok" };
  } catch (error) {
    return { status: "error", error };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Un solo refresh a la vez: Supabase rota el refresh token, así que dos 401 simultáneos que refrescaran
// por separado harían fallar al segundo y cerrarían una sesión válida.
let pendingRefresh: Promise<RefreshResult> | null = null;

const REFRESH_LOCK = "ofibites-auth-refresh";

/**
 * Un refresh a la vez entre pestañas (Web Locks): la segunda pestaña espera, relee localStorage y
 * usa los tokens que dejó la primera en vez de gastar un refresh token ya rotado.
 */
function refreshWithLock(failedToken: string | null): Promise<RefreshResult> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    const { locks } = navigator;
    // El tipo de `request` envuelve dos veces la promesa del callback: se resuelve a mano.
    return new Promise<RefreshResult>((resolve, reject) => {
      locks
        .request(REFRESH_LOCK, () => requestTokenRefresh(failedToken).then(resolve, reject))
        .catch(reject);
    });
  }
  return requestTokenRefresh(failedToken);
}

/**
 * Refresca el access token. Solo si `/auth/refresh` lo rechaza (400/401) borra los tokens y avisa
 * al store para cerrar la sesión; con red, timeout o 5xx devuelve el error sin tocar la sesión.
 */
async function refreshAccessToken(failedToken: string | null): Promise<RefreshResult> {
  if (!pendingRefresh) {
    pendingRefresh = refreshWithLock(failedToken)
      .then((result) => {
        if (result.status === "rejected") {
          tokenManager.clearTokens();
          notifySessionExpired();
        }
        return result;
      })
      .finally(() => {
        pendingRefresh = null;
      });
  }
  return pendingRefresh;
}

export async function authFetcher<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = TIMEOUT_MS, ...fetchOptions } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const isFormData = fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  mergeHeaders(headers, fetchOptions.headers);

  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Empresa activa de la sesión, salvo que la petición traiga la suya.
  const companyId = getActiveCompanyId();
  if (companyId && !Object.keys(headers).some((key) => key.toLowerCase() === "x-company-id")) {
    headers["X-Company-Id"] = companyId;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401) {
      clearTimeout(timeoutId);
      // Si el token ya cambió (otra petición u otra pestaña refrescaron), se reintenta sin refrescar:
      // refrescar de nuevo gastaría un refresh token ya rotado.
      const refresh = wasRefreshedElsewhere(accessToken)
        ? ({ status: "ok" } as const)
        : await refreshAccessToken(accessToken);
      if (refresh.status === "error") throw refresh.error;
      if (refresh.status === "ok") {
        const newToken = tokenManager.getAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
        }
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(
          () => retryController.abort(),
          timeout
        );
        try {
          response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: retryController.signal,
          });
        } finally {
          clearTimeout(retryTimeoutId);
        }
      } else {
        const error: ApiError = {
          statusCode: 401,
          message: "Tu sesión ha caducado. Inicia sesión de nuevo.",
        };
        throw error;
      }
    }

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      const timeoutError: ApiError = {
        statusCode: 408,
        message: "Request timed out",
      };
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetcher<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = TIMEOUT_MS, ...fetchOptions } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const isFormData = fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  mergeHeaders(headers, fetchOptions.headers);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      const timeoutError: ApiError = {
        statusCode: 408,
        message: "Request timed out",
      };
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
