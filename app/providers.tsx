"use client";

import { useState } from "react";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@/domain/stores";
import { createQueryClient } from "@/shared/config";
import { configureAuthSession } from "@/shared/utils/fetch";

/**
 * Conecta `authFetcher` (shared) con la sesión (domain) sin que shared importe domain:
 * la empresa activa va en `X-Company-Id` y, si el refresh se rechaza, se cierra la sesión y se vacía
 * la caché (las guardas llevan a `/login`). Se registra al crear el `QueryClient`, antes de que
 * cualquier hijo lance peticiones.
 */
function createSessionQueryClient(): QueryClient {
  const queryClient = createQueryClient();
  configureAuthSession({
    getCompanyId: () => useAuthStore.getState().activeCompanyId,
    onSessionExpired: () => {
      useAuthStore.getState().logout();
      // Solo las queries: puede llegar con una mutación en curso (p. ej. el logout).
      queryClient.removeQueries();
    },
  });
  return queryClient;
}

export function Providers(
  { children }: { children: React.ReactNode }
) {
  const [queryClient] = useState(createSessionQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </QueryClientProvider>
  );
}
