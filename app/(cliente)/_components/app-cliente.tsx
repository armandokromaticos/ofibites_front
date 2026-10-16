"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useLogout } from "@/domain/hooks/auth";
import { useClientUser } from "@/domain/hooks/dashboard";
import { TmAppLayout } from "@/ui/atomic";

import { MENU_CUENTA_CLIENTE, NAV_ITEMS_CLIENTE, paginaClienteActual, RUTA_DASHBOARD } from "../_navegacion";

import {
  marcarVueltaCliente,
  refrescarRutaActualCliente,
  registrarRutaCliente,
  reiniciarRutasCliente,
} from "./ruta-anterior";
import { useTopBarCliente } from "./use-top-bar-cliente";

/**
 * Esqueleto de la app del cliente, montado UNA vez por el layout de `(cliente)`: el sidebar y la top bar no se
 * re-montan al navegar entre sus páginas (solo cambia el `<main>`, que anima como página). El título de la top
 * bar y el ítem activo salen de la ruta (`paginaClienteActual`), no de cada página.
 */
export function AppCliente({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pagina = paginaClienteActual(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Usuario del sidebar y del menú de cuenta: de la sesión (nombre, correo, empresa y rol activos), sin peticiones.
  const user = useClientUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  // Carrito y notificaciones de la top bar (`GET /cart`, `GET /notifications`); "Añadir al carrito" actualiza
  // el contador con su respuesta.
  const topBar = useTopBarCliente();

  // Rutas anteriores para los "‹ Volver" (`ruta-anterior.ts`): el clic en un enlace (en captura, antes de que
  // navegue) recoge la query actual, que Ordenar cambia sin navegar; atrás/adelante del navegador cuentan como
  // vuelta; al desmontar (cerrar sesión) se vacían.
  useEffect(() => {
    const alPulsar = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("a[href]")) refrescarRutaActualCliente();
    };
    document.addEventListener("click", alPulsar, true);
    window.addEventListener("popstate", marcarVueltaCliente);
    return () => {
      document.removeEventListener("click", alPulsar, true);
      window.removeEventListener("popstate", marcarVueltaCliente);
      reiniciarRutasCliente();
    };
  }, []);

  useEffect(() => {
    registrarRutaCliente();
  }, [pathname]);

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
      cart={topBar.cart}
      notifications={topBar.notifications}
      account={
        user
          ? {
              user: {
                name: user.fullName,
                email: user.email,
                avatarSrc: user.avatarSrc,
                companyName: user.companyName,
                role: user.companyName ? user.role : undefined,
              },
              items: MENU_CUENTA_CLIENTE,
              // El mismo cierre que el sidebar: los dos muestran "Cerrando sesión…" a la vez.
              onLogout: () => logout(),
              isLoggingOut,
            }
          : undefined
      }
      mainClassName="px-4 pb-10 pt-6 sm:px-8 xl:pt-[42px]"
    >
      {children}
    </TmAppLayout>
  );
}
