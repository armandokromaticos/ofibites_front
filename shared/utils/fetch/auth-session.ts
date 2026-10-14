/**
 * Puente entre `authFetcher` (shared) y el store de sesión (domain), sin que shared importe domain.
 * El store se registra al cargarse (`domain/stores/auth.store.ts`).
 */
export interface AuthSessionBridge {
  /** Empresa activa para el header `X-Company-Id`. `null` si no hay. */
  getCompanyId: () => string | null;
  /** El refresh falló: hay que limpiar la sesión (las guardas llevan a `/login`). */
  onSessionExpired: () => void;
}

let bridge: AuthSessionBridge | null = null;

export function configureAuthSession(next: AuthSessionBridge): void {
  bridge = next;
}

export function getActiveCompanyId(): string | null {
  return bridge?.getCompanyId() ?? null;
}

export function notifySessionExpired(): void {
  bridge?.onSessionExpired();
}
