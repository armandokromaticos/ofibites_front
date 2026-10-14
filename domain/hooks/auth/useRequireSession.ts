import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { getHomePath, pickActiveCompanyId } from "@/domain/models/auth.model";
import { useAuthHydrated, useAuthStore } from "@/domain/stores";
import { UserRole } from "@/domain/types";

import { useMe } from "./useMe";

interface UseRequireSessionOptions {
  /** Roles que pueden ver la ruta. */
  roles: readonly UserRole[];
}

export type RequireSessionStatus = "checking" | "allowed" | "redirecting";

/**
 * Guarda de rutas protegidas (en un layout cliente).
 * - Espera a que el store persistido se hidrate: al recargar con sesión no salta a `/login`.
 * - Sin sesión → `/login`. Con un rol no admitido → el inicio de su rol (`getHomePath`).
 * - Con sesión, refresca `/auth/me` (perfil y memberships). Si el refresh del token falla,
 *   `authFetcher` limpia la sesión y esta guarda lleva a `/login`.
 *
 * Mientras `status !== "allowed"`, el layout no debe pintar contenido protegido.
 */
export function useRequireSession({ roles }: UseRequireSessionOptions): RequireSessionStatus {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasHydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const syncMe = useAuthStore((state) => state.syncMe);
  const logout = useAuthStore((state) => state.logout);

  const hasSession = hasHydrated && isAuthenticated && user !== null;
  const isAllowed = hasSession && roles.includes(user.role);
  const redirectTo = !hasHydrated ? null : !hasSession ? "/login" : isAllowed ? null : getHomePath(user.role);

  const { data: me } = useMe({ enabled: isAllowed });

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  useEffect(() => {
    if (!me) return;
    // Un cliente que ya no tiene ninguna empresa operativa pierde la sesión (el login tampoco le dejaría entrar).
    if (me.user.role === "CLIENT" && !pickActiveCompanyId(me.memberships)) {
      logout("sin-empresa");
      queryClient.removeQueries();
      return;
    }
    syncMe(me);
  }, [me, syncMe, logout, queryClient]);

  if (!hasHydrated) return "checking";
  return isAllowed ? "allowed" : "redirecting";
}
