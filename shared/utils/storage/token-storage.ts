const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch {
    // Safari private mode, storage quota exceeded, etc.
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch {
    // Safari private mode, storage quota exceeded, etc.
  }
}

class TokenManager {
  private static instance: TokenManager;

  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    this.syncFromStorage();
    // Otra pestaña refrescó o cerró la sesión: se adoptan sus tokens para no reutilizar
    // un refresh token que Supabase ya rotó.
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key === null || event.key === ACCESS_TOKEN_KEY || event.key === REFRESH_TOKEN_KEY) {
          this.syncFromStorage();
        }
      });
    }
  }

  /** Relee los tokens de localStorage (la fuente compartida entre pestañas). */
  syncFromStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch {
      // Sin localStorage (Safari privado...): los tokens solo viven en memoria y se conservan.
    }
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    safeSetItem(ACCESS_TOKEN_KEY, accessToken);
    safeSetItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    safeRemoveItem(ACCESS_TOKEN_KEY);
    safeRemoveItem(REFRESH_TOKEN_KEY);
  }
}

export const tokenManager = TokenManager.getInstance();
