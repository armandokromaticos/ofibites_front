"use client";

import { ReactNode, useEffect, useRef, useState, ViewTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@heroui/react";
import { Bell, Menu, ShoppingCart } from "lucide-react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { AtAvatar, AtButton, AtIconButton } from "@/app/lib/atomic/atoms";
import { OrAppSidebar, OrAppSidebarDrawerCloseReason } from "@/app/lib/atomic/organisms";

import { TmAppLayoutProps, TmAppLayoutTopBarAction } from "./tm-app-layout.types";

const DRAWER_ID = "app-drawer";

interface TopBarActionProps {
  action: TmAppLayoutTopBarAction;
  label: string;
  icon: ReactNode;
  /** Pulso sobre el contador: avisos nuevos (notificaciones), no el carrito. */
  badgePing?: boolean;
}

function TopBarAction({ action, label, icon, badgePing }: TopBarActionProps) {
  const linkProps = action.href ? { as: Link, href: action.href } : { onPress: action.onPress };

  return (
    <AtIconButton aria-label={label} badgeContent={action.count} badgePing={badgePing} {...linkProps}>
      {icon}
    </AtIconButton>
  );
}

/**
 * Layout de la app del cliente: sidebar + top bar + contenido.
 * - Escritorio y tablet (≥ 768 px): riel de 80 px con el panel superpuesto de `OrAppSidebar`.
 * - Móvil (< 768 px): sin riel; la top bar (56 px) lleva una hamburguesa que abre el mismo panel como
 *   drawer modal. El estado del drawer es del layout: al cerrarse, el foco vuelve a la hamburguesa.
 */
export function TmAppLayout({
  sidebar,
  title,
  titleIcon,
  cart,
  notifications,
  children,
  mainClassName,
  className,
}: TmAppLayoutProps) {
  const pathname = usePathname();
  const user = sidebar.user;
  const cartCount = cart?.count ?? 0;
  const unreadCount = notifications?.count ?? 0;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // A dónde vuelve el foco al cerrar: la hamburguesa; si el drawer se cerró porque la ventana creció, la
  // hamburguesa ya no se ve y el foco va al contenido.
  const returnFocusTo = useRef<"menu" | "main" | null>(null);

  const closeDrawer = (reason: OrAppSidebarDrawerCloseReason) => {
    returnFocusTo.current = reason === "resize" ? "main" : "menu";
    setIsDrawerOpen(false);
  };

  // Tras el render: mientras el drawer está abierto el resto es `inert` y no acepta el foco.
  useEffect(() => {
    if (isDrawerOpen || !returnFocusTo.current) return;
    (returnFocusTo.current === "main" ? mainRef : menuButtonRef).current?.focus();
    returnFocusTo.current = null;
  }, [isDrawerOpen]);

  return (
    <div className={cn("relative flex h-dvh overflow-hidden bg-background", className)}>
      {/* Con el drawer abierto (modal), todo lo de fuera queda inerte: ni foco ni lectores de pantalla. */}
      <a
        href="#app-main"
        inert={isDrawerOpen}
        className={cn(
          "sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
          "focus:not-sr-only focus:absolute focus:left-4 focus:top-4",
        )}
      >
        Saltar al contenido
      </a>

      {/* Sidebar y top bar: entran con la página (desde el login) y se quedan quietos entre rutas. */}
      <ViewTransition
        name={VIEW_TRANSITION_NAME.appSidebar}
        enter={VIEW_TRANSITION_CLASS.page}
        default="none"
      >
        <OrAppSidebar
          {...sidebar}
          drawer={{ isOpen: isDrawerOpen, onClose: closeDrawer, id: DRAWER_ID }}
        />
      </ViewTransition>

      <div inert={isDrawerOpen} className="flex min-w-0 flex-1 flex-col">
        <ViewTransition enter={VIEW_TRANSITION_CLASS.page} default="none">
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-content1 px-4 md:h-[72px] md:gap-4 md:px-6 md:py-4">
            <div className="flex min-w-0 items-center gap-2.5 text-foreground-strong">
              <AtButton
                ref={menuButtonRef}
                isIconOnly
                variant="light"
                color="default"
                className="-ml-2 size-10 min-w-10 text-foreground-strong md:hidden [&_svg]:size-5"
                aria-label="Abrir menú"
                aria-expanded={isDrawerOpen}
                aria-controls={DRAWER_ID}
                aria-haspopup="dialog"
                onPress={() => setIsDrawerOpen(true)}
              >
                <Menu aria-hidden="true" />
              </AtButton>
              {titleIcon && (
                <span aria-hidden="true" className="hidden shrink-0 min-[400px]:block [&_svg]:size-[18px]">
                  {titleIcon}
                </span>
              )}
              <h1 className="truncate text-base font-black md:text-lg">{title}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-4">
              {cart && (
                <TopBarAction
                  action={cart}
                  label={
                    cartCount
                      ? `Carrito, ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`
                      : "Carrito"
                  }
                  icon={<ShoppingCart aria-hidden="true" />}
                />
              )}
              {notifications && (
                <TopBarAction
                  action={notifications}
                  label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
                  icon={<Bell aria-hidden="true" />}
                  badgePing
                />
              )}
              {user && <AtAvatar src={user.avatarSrc} name={user.name} />}
            </div>
          </header>
        </ViewTransition>

        {/*
          Por ruta (key = pathname): entra y sale como página. Un cambio dentro de la misma ruta
          (filtros, query params) no anima.
        */}
        <ViewTransition
          key={pathname}
          enter={VIEW_TRANSITION_CLASS.page}
          exit={VIEW_TRANSITION_CLASS.page}
          update="none"
          default="none"
        >
          <main
            ref={mainRef}
            id="app-main"
            tabIndex={-1}
            className={cn("flex-1 overflow-y-auto p-6 outline-none", mainClassName)}
          >
            {children}
          </main>
        </ViewTransition>
      </div>
    </div>
  );
}
