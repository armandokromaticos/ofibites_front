const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch {
    // Safari private mode, storage quota exceeded, etc.
  }
  return null;
}

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
    this.accessToken = safeGetItem(ACCESS_TOKEN_KEY);
    this.refreshToken = safeGetItem(REFRESH_TOKEN_KEY);
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
