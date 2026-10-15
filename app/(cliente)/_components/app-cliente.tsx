"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import { useLogout } from "@/domain/hooks/auth";
import { useClientDashboard } from "@/domain/hooks/dashboard";
import { TmAppLayout } from "@/app/lib/atomic";

import { NAV_ITEMS_CLIENTE, paginaClienteActual, RUTA_CARRITO, RUTA_DASHBOARD } from "../_navegacion";

/**
 * Esqueleto de la app del cliente, montado UNA vez por el layout de `(cliente)`: el sidebar y la top bar no se
 * re-montan al navegar entre sus páginas (solo cambia el `<main>`, que anima como página). El título de la top
 * bar y el ítem activo salen de la ruta (`paginaClienteActual`), no de cada página.
 */
export function AppCliente({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pagina = paginaClienteActual(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // TODO: conectar API (T-04). El usuario del sidebar sale de los datos de ejemplo del dashboard.
  const { data } = useClientDashboard({});
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const user = data?.user;

  return (
    <TmAppLayout
      title={pagina.label}
      titleIcon={pagina.icon}
      sidebar={{
        items: NAV_ITEMS_CLIENTE,
        activeKey: pagina.navKey,
        isOpen: isSidebarOpen,
        onToggle: () => setIsSidebarOpen((open) => !open),
        onClose: () => setIsSidebarOpen(false),
        homeHref: RUTA_DASHBOARD,
        onLogout: () => logout(),
        isLoggingOut,
        user: user ? { name: user.shortName, role: user.role, avatarSrc: user.avatarSrc } : undefined,
      }}
      // TODO: conectar API (T-04). Contador del carrito y notificaciones sin leer.
      cart={{ href: RUTA_CARRITO }}
      notifications={{}}
      mainClassName="px-4 pb-10 pt-6 sm:px-8 xl:pt-[42px]"
    >
      {children}
    </TmAppLayout>
  );
}
