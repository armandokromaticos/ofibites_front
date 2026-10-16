"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@heroui/react";
import { Menu } from "lucide-react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { AtAvatar, AtButton } from "@/ui/atomic/atoms";
import {
  OrAccountMenu,
  OrAppSidebar,
  OrAppSidebarDrawerCloseReason,
  OrCartPopover,
  OrNotificationsPopover,
} from "@/ui/atomic/organisms";

import { TmAppLayoutProps } from "./tm-app-layout.types";

const DRAWER_ID = "app-drawer";

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
  account,
  children,
  mainClassName,
  className,
}: TmAppLayoutProps) {
  const pathname = usePathname();
  const user = sidebar.user;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // A dónde vuelve el foco al cerrar: la hamburguesa; si el drawer se cerró porque la ventana creció (la
  // hamburguesa ya no se ve) o al navegar (hay contenido nuevo), el foco va al contenido.
  const returnFocusTo = useRef<"menu" | "main" | null>(null);

  // Al cerrar por un enlace del drawer, el drawer se cierra antes de que cambie la ruta y el `<main>` (con
  // `key={pathname}`) se re-monta después: se guarda la ruta del cierre para enfocar el `<main>` nuevo.
  const focusMainAfterRoute = useRef<string | null>(null);

  const closeDrawer = (reason: OrAppSidebarDrawerCloseReason) => {
    returnFocusTo.current = reason === "resize" || reason === "navigate" ? "main" : "menu";
    focusMainAfterRoute.current = reason === "navigate" ? pathname : null;
    setIsDrawerOpen(false);
  };

  // Tras el render: mientras el drawer está abierto el resto es `inert` y no acepta el foco.
  useEffect(() => {
    if (isDrawerOpen || !returnFocusTo.current) return;
    (returnFocusTo.current === "main" ? mainRef : menuButtonRef).current?.focus();
    returnFocusTo.current = null;
  }, [isDrawerOpen]);

  // La ruta cambió tras cerrar con un enlace: foco al `<main>` nuevo. Si el cierre fue por el propio cambio de
  // ruta (atrás del navegador), la ruta guardada ya es la actual y el efecto de arriba basta.
  useEffect(() => {
    const closedAt = focusMainAfterRoute.current;
    if (closedAt === null) return;
    focusMainAfterRoute.current = null;
    if (closedAt !== pathname) mainRef.current?.focus();
  }, [pathname]);

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
                onPress={() => {
                  focusMainAfterRoute.current = null;
                  setIsDrawerOpen(true);
                }}
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
              {/* Popovers: el panel va en un portal (fuera del `inert` del drawer) y solo hay uno abierto. */}
              {cart && <OrCartPopover {...cart} />}
              {notifications && <OrNotificationsPopover {...notifications} />}
              {account ? (
                <OrAccountMenu {...account} />
              ) : (
                user && <AtAvatar src={user.avatarSrc} name={user.name} />
              )}
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
