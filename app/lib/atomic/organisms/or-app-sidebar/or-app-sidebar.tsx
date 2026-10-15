"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import { Avatar, cn } from "@heroui/react";
import { LogOut, Menu } from "lucide-react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { AtButton } from "@/app/lib/atomic/atoms";

import { OrAppSidebarItem, OrAppSidebarProps } from "./or-app-sidebar.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

interface SidebarLinkProps {
  item: OrAppSidebarItem;
  isActive: boolean;
  isOpen: boolean;
}

function SidebarLink({ item, isActive, isOpen }: SidebarLinkProps) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={isOpen ? undefined : item.label}
      title={isOpen ? undefined : item.label}
      className={cn(
        "flex h-[60px] items-center gap-3 rounded-control transition-colors",
        isOpen ? "w-full px-3" : "w-[60px] justify-center",
        isActive ? "bg-nav-active shadow-xs" : "hover:bg-background",
        FOCUS_RING,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg text-primary [&_svg]:size-5",
          isActive ? "bg-nav-active-icon-bg" : "bg-nav-icon-bg",
        )}
      >
        {item.icon}
      </span>
      {isOpen && (
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-sm leading-5",
              isActive ? "font-extrabold text-foreground" : "font-semibold text-muted",
            )}
          >
            {item.label}
          </span>
          {item.description && (
            <span
              className={cn(
                "truncate text-xs leading-4",
                isActive ? "text-foreground" : "text-muted",
              )}
            >
              {item.description}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

interface LogoutButtonProps {
  isOpen: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

/** Mismo aspecto que un ítem inactivo del menú, pero más bajo: es una acción, no una sección. */
function LogoutButton({ isOpen, isLoggingOut, onLogout }: LogoutButtonProps) {
  const label = isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión";

  return (
    <button
      type="button"
      onClick={isLoggingOut ? undefined : onLogout}
      // aria-disabled y no disabled: el foco no cae a <body> mientras se cierra la sesión.
      aria-disabled={isLoggingOut || undefined}
      aria-label={isOpen ? undefined : label}
      title={isOpen ? undefined : label}
      className={cn(
        "flex h-12 items-center gap-3 rounded-control text-muted transition-colors hover:bg-background",
        isOpen ? "w-full px-3" : "w-[60px] justify-center",
        isLoggingOut && "cursor-wait opacity-70",
        FOCUS_RING,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-nav-icon-bg text-primary [&_svg]:size-5"
      >
        <LogOut />
      </span>
      {isOpen && <span className="truncate text-sm font-semibold leading-5">{label}</span>}
    </button>
  );
}

export function OrAppSidebar({
  items,
  activeKey,
  isOpen,
  onToggle,
  user,
  homeHref = "/",
  onLogout,
  isLoggingOut = false,
  navId = "app-sidebar-nav",
  logoTransitionName = VIEW_TRANSITION_NAME.logo,
  className,
}: OrAppSidebarProps) {
  const logo = isOpen ? (
    <Image src="/images/brand/logo-ofibites.svg" alt="" width={110} height={32} preload />
  ) : (
    <Image src="/images/brand/logo-mark.png" alt="" width={25} height={33} preload />
  );

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col justify-between border-r border-border-subtle bg-content1 pt-8",
        "motion-safe:transition-[width] motion-safe:duration-200",
        isOpen ? "w-[236px] px-2.5" : "w-20 items-center",
        className,
      )}
    >
      <div className={cn("flex w-full flex-col gap-10", isOpen ? "items-start" : "items-center")}>
        <div className={cn("flex flex-col gap-5", isOpen ? "items-start px-5" : "items-center")}>
          <Link
            href={homeHref}
            aria-label="Ofibites, ir al inicio"
            className={cn("rounded-sm", FOCUS_RING)}
          >
            {/* Mismo nombre que el logo de las pantallas de acceso: tras el login, viaja hasta aquí. */}
            {logoTransitionName ? (
              <ViewTransition name={logoTransitionName} share={VIEW_TRANSITION_CLASS.shared}>
                {logo}
              </ViewTransition>
            ) : (
              logo
            )}
          </Link>
          <AtButton
            isIconOnly
            size="sm"
            variant="light"
            color="default"
            className={cn("text-primary", isOpen && "-mx-1.5")}
            aria-label={isOpen ? "Contraer menú" : "Expandir menú"}
            aria-expanded={isOpen}
            aria-controls={navId}
            onPress={onToggle}
          >
            <Menu aria-hidden="true" className="size-5" />
          </AtButton>
        </div>

        <nav id={navId} aria-label="Principal" className="w-full">
          <ul className={cn("flex flex-col gap-5", isOpen ? "items-stretch" : "items-center")}>
            {items.map((item) => (
              <li key={item.key} className={isOpen ? "w-full" : undefined}>
                <SidebarLink item={item} isActive={item.key === activeKey} isOpen={isOpen} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex w-full shrink-0 flex-col">
        {onLogout && (
          <div className={cn("flex w-full pb-3", !isOpen && "justify-center")}>
            <LogoutButton isOpen={isOpen} isLoggingOut={isLoggingOut} onLogout={onLogout} />
          </div>
        )}

        {user && (
          <div
            className={cn(
              "flex h-[84px] w-full shrink-0 items-center gap-[15px] border-t border-divider py-4",
              isOpen ? "px-5" : "justify-center",
            )}
          >
            <Avatar
              src={user.avatarSrc}
              name={user.name}
              showFallback
              className="size-10 shrink-0"
              imgProps={{ alt: isOpen ? "" : user.name }}
            />
            {isOpen && (
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-base font-semibold text-foreground">{user.name}</span>
                {user.role && <span className="truncate text-sm text-foreground">{user.role}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
