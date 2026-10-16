import { useMemo } from "react";

import { toClientDashboardUser } from "@/domain/adapters";
import { ClientDashboardUser } from "@/domain/models";
import { useAuthStore } from "@/domain/stores";

/** Usuario del sidebar y del saludo, de la sesión (nombre y rol en la empresa activa). `null` sin sesión. */
export function useClientUser(): ClientDashboardUser | null {
  const user = useAuthStore((state) => state.user);
  const memberships = useAuthStore((state) => state.memberships);
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useMemo(
    () => (user ? toClientDashboardUser(user, memberships, activeCompanyId) : null),
    [user, memberships, activeCompanyId],
  );
}
