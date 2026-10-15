"use client";

import { useState } from "react";

import { Utensils } from "lucide-react";

import { useLogout } from "@/domain/hooks/auth";
import { useClientDashboard } from "@/domain/hooks/dashboard";
import { MlEmptyState, TmAppLayout } from "@/app/lib/atomic";

import {
  CategoriaOrdenar,
  CATEGORIAS_ORDENAR,
  NAV_ITEMS_CLIENTE,
  RUTA_DASHBOARD,
} from "../dashboard/navegacion-cliente";

interface OrdenarProvisionalProps {
  categoria?: CategoriaOrdenar;
  /** Pedido que se quiere repetir ("Repetir" del dashboard). */
  repetir?: string;
}

// Provisional: la pantalla real llega con T-19. Sin productos ni precios: solo el aviso y la vuelta.
export function OrdenarProvisional({ categoria, repetir }: OrdenarProvisionalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // TODO: conectar API (T-04). El usuario del sidebar sale, como en el dashboard, de sus datos de ejemplo.
  const { data } = useClientDashboard({});
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const user = data?.user;
  const catalogo = categoria ? CATEGORIAS_ORDENAR[categoria] : "surtidos";

  return (
    <TmAppLayout
      title="Ordenar"
      titleIcon={<Utensils />}
      sidebar={{
        items: NAV_ITEMS_CLIENTE,
        activeKey: "ordenar",
        isOpen: isSidebarOpen,
        onToggle: () => setIsSidebarOpen((open) => !open),
        onClose: () => setIsSidebarOpen(false),
        homeHref: RUTA_DASHBOARD,
        onLogout: () => logout(),
        isLoggingOut,
        user: user ? { name: user.shortName, role: user.role, avatarSrc: user.avatarSrc } : undefined,
      }}
      // TODO: conectar API (T-04). Contador del carrito y notificaciones sin leer.
      cart={{ href: "/carrito" }}
      notifications={{}}
      mainClassName="flex items-start justify-center px-4 pb-10 pt-6 sm:px-8 xl:pt-[42px]"
    >
      <div className="w-full max-w-xl rounded-card bg-content1">
        <MlEmptyState
          headingLevel={2}
          icon={<Utensils />}
          // TODO: repetir pedido (T-19). Con el catálogo real, "Repetir" precargará el carrito con este pedido.
          title={repetir ? `Muy pronto podrás repetir el pedido #${repetir} desde aquí` : "Muy pronto podrás ordenar desde aquí"}
          description={
            repetir
              ? "Estamos preparando el catálogo para que puedas pedir lo mismo con un clic."
              : `Estamos preparando el catálogo de ${catalogo}.`
          }
          actionLabel="Volver al dashboard"
          actionHref={RUTA_DASHBOARD}
        />
      </div>
    </TmAppLayout>
  );
}
