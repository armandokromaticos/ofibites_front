"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMe } from "@/domain/hooks/auth";
import { useAuthHydrated, useAuthStore } from "@/domain/stores";

import { RUTA_DASHBOARD } from "../../_navegacion";

export type RequireCompanyAdminStatus = "checking" | "allowed" | "redirecting";

/**
 * Guarda de `/administracion`: el `(cliente)/layout.tsx` ya exige `CLIENT` (sesión); esta añade que la
 * membresía de la empresa activa sea `COMPANY_ADMIN` (el back ya restringe los endpoints de escritura a
 * ese rol — esto solo evita mostrar la pantalla a quien no la puede usar). Sin membresía admin → `/dashboard`.
 *
 * `(cliente)/layout.tsx` marca la sesión como permitida en cuanto el store persistido (localStorage) dice
 * que hay sesión CLIENT, **sin esperar** a que `GET /auth/me` resuelva; ese fetch solo corrige `memberships`
 * en el store cuando responde. Si decidiéramos con `memberships` del store tal cual se monta este layout,
 * usaríamos las persistidas de la sesión anterior (p. ej. un rol cambiado después del último login), con
 * riesgo de redirigir de más antes de que llegue la corrección. Por eso usamos `useMe` (misma `queryKey` que
 * el layout padre: React Query la dedup, no duplica la petición) y, mientras esta carga no tenga una
 * resolución propia (éxito o error), nos quedamos en `"checking"` en vez de decidir.
 */
export function useRequireCompanyAdmin(): RequireCompanyAdminStatus {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const persistedMemberships = useAuthStore((state) => state.memberships);

  const { data: me, isError: meErrored } = useMe({ enabled: hasHydrated });

  // Memberships a usar: las frescas de `/auth/me` si ya resolvió en esta carga; si falló (red, etc.), las
  // persistidas como mejor esfuerzo, igual que el comportamiento anterior; mientras está en vuelo, ninguna
  // todavía (null) para no decidir con datos que pueden estar desactualizados.
  const memberships = me ? me.memberships : meErrored ? persistedMemberships : null;
  const canDecide = memberships !== null;

  const membership = memberships?.find((item) => item.companyId === activeCompanyId);
  const isAllowed = hasHydrated && canDecide && membership?.role === "COMPANY_ADMIN";
  const shouldRedirect = hasHydrated && canDecide && !isAllowed;

  useEffect(() => {
    if (shouldRedirect) router.replace(RUTA_DASHBOARD);
  }, [shouldRedirect, router]);

  if (!hasHydrated || !canDecide) return "checking";
  return isAllowed ? "allowed" : "redirecting";
}
