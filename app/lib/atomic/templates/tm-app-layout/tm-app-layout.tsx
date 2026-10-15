"use client";

import { ReactNode, ViewTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, cn } from "@heroui/react";
import { Bell, ShoppingCart } from "lucide-react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { AtIconButton } from "@/app/lib/atomic/atoms";
import { OrAppSidebar } from "@/app/lib/atomic/organisms";

import { TmAppLayoutProps, TmAppLayoutTopBarAction } from "./tm-app-layout.types";

interface TopBarActionProps {
  action: TmAppLayoutTopBarAction;
  label: string;
  icon: ReactNode;
}

function TopBarAction({ action, label, icon }: TopBarActionProps) {
  const linkProps = action.href ? { as: Link, href: action.href } : { onPress: action.onPress };

  return (
    <AtIconButton aria-label={label} badgeContent={action.count} {...linkProps}>
      {icon}
    </AtIconButton>
  );
}

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

  return (
    <div className={cn("relative flex h-dvh overflow-hidden bg-background", className)}>
      <a
        href="#app-main"
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
        <OrAppSidebar {...sidebar} />
      </ViewTransition>

      <div className="flex min-w-0 flex-1 flex-col">
        <ViewTransition enter={VIEW_TRANSITION_CLASS.page} default="none">
          <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-content1 px-6 py-4">
            <div className="flex min-w-0 items-center gap-2.5 text-foreground-strong">
              {titleIcon && (
                <span aria-hidden="true" className="shrink-0 [&_svg]:size-[18px]">
                  {titleIcon}
                </span>
              )}
              <h1 className="truncate text-lg font-black">{title}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-4">
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
                />
              )}
              {user && (
                <Avatar
                  src={user.avatarSrc}
                  name={user.name}
                  showFallback
                  className="size-10 shrink-0"
                  imgProps={{ alt: user.name }}
                />
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
