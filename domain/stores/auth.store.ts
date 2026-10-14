import { useSyncExternalStore } from "react";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { pickActiveCompanyId } from "@/domain/models/auth.model";
import { Membership, MeResponse, User } from "@/domain/types";
import { tokenManager } from "@/shared/utils/storage";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/** Por qué se cerró la sesión sin que el usuario lo pidiera; `/login` lo explica. No se persiste. */
export type SignOutReason = "sin-empresa";

interface AuthState {
  user: User | null;
  memberships: Membership[];
  /** Empresa con la que se opera: va en `X-Company-Id`. */
  activeCompanyId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOutReason: SignOutReason | null;
}

interface AuthActions {
  /** Sesión completa tras `POST /auth/login` + `GET /auth/me`. Guarda los tokens y marca la sesión. */
  setSession: (session: { accessToken: string; refreshToken: string; me: MeResponse }) => void;
  /** Actualiza perfil y memberships con un `GET /auth/me` posterior, conservando la empresa activa si sigue valiendo. */
  syncMe: (me: MeResponse) => void;
  setActiveCompanyId: (companyId: string) => void;
  /** Borra tokens y sesión. `reason` queda para que `/login` muestre el aviso. */
  logout: (reason?: SignOutReason) => void;
  clearSignOutReason: () => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const EMPTY_SESSION: Omit<AuthState, "signOutReason"> = {
  user: null,
  memberships: [],
  activeCompanyId: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      signOutReason: null,

      setSession: ({ accessToken, refreshToken, me }) => {
        tokenManager.setTokens(accessToken, refreshToken);
        set({
          user: me.user,
          memberships: me.memberships,
          activeCompanyId: pickActiveCompanyId(me.memberships),
          isAuthenticated: true,
          isLoading: false,
          signOutReason: null,
        });
      },

      syncMe: (me) => {
        set({
          user: me.user,
          memberships: me.memberships,
          activeCompanyId: pickActiveCompanyId(me.memberships, get().activeCompanyId),
        });
      },

      setActiveCompanyId: (companyId) => {
        set({ activeCompanyId: companyId });
      },

      logout: (reason) => {
        tokenManager.clearTokens();
        set({ ...EMPTY_SESSION, signOutReason: reason ?? null });
      },

      clearSignOutReason: () => {
        set({ signOutReason: null });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        activeCompanyId: state.activeCompanyId,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: typeof window === "undefined",
      // Una sesión persistida sin tokens (borrados a mano o por otra pestaña) no es una sesión.
      onRehydrateStorage: () => (state) => {
        const hasTokens = tokenManager.getAccessToken() || tokenManager.getRefreshToken();
        if (state?.isAuthenticated && !hasTokens) {
          state.logout();
        }
      },
    }
  )
);

const subscribeToHydration = (onChange: () => void) => useAuthStore.persist.onFinishHydration(onChange);
const getHydrated = () => useAuthStore.persist.hasHydrated();
const getServerHydrated = () => false;

/**
 * `true` cuando el store persistido ya se leyó de localStorage. En el servidor y en el primer render
 * del cliente (hidratación de React) devuelve `false`, para que ambos pinten lo mismo; luego, `true`.
 * Las guardas esperan a esto antes de decidir.
 */
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribeToHydration, getHydrated, getServerHydrated);
}
