"use client";

import { CSSProperties, useEffect, useRef, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, cn } from "@heroui/react";
import { LogOut } from "lucide-react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { AtButton, AtTooltip } from "@/app/lib/atomic/atoms";

import { OrAppSidebarItem, OrAppSidebarProps } from "./or-app-sidebar.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Icono de un ítem inactivo: sube 2 px al pasar o enfocar (microfeedback, curva spring). */
const ICON_LIFT = cn(
  "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-spring",
  "motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:-translate-y-0.5",
);

/** Líneas del icono de menú (mismo trazo que `Menu` de lucide) que se cruzan en una X al abrir. */
const MENU_LINE = cn(
  "origin-center [transform-box:fill-box]",
  "motion-safe:transition-[translate,rotate,opacity] motion-safe:duration-(--duration-fast) motion-safe:ease-in-out",
);

function MenuMorphIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-5"
    >
      <path d="M4 5h16" className={cn(MENU_LINE, isOpen && "translate-y-[7px] rotate-45")} />
      <path d="M4 12h16" className={cn(MENU_LINE, isOpen && "opacity-0")} />
      <path d="M4 19h16" className={cn(MENU_LINE, isOpen && "-translate-y-[7px] -rotate-45")} />
    </svg>
  );
}

/*
 * Panel superpuesto: en el flujo el sidebar ocupa siempre el riel de 80 px; el panel de 236 px va encima
 * del contenido y se descubre con `clip-path` (no `width`), así la página no se reflowea al abrir.
 * Abrir: 320 ms ease-out. Cerrar: 200 ms ease-in. Con movimiento reducido el recorte cambia al instante y
 * las etiquetas solo se funden.
 *
 * Cada ítem ocupa todo el ancho del panel y lleva su propio recorte, sincronizado con el del panel:
 * cerrado se ve el cuadrado de 60 px (icono centrado en el riel), abierto la fila completa. Así el icono no
 * se mueve nunca. Los -4 px del recorte dejan ver el anillo de foco.
 */
function panelTransition(isOpen: boolean) {
  return cn(
    "transition-[clip-path,box-shadow] motion-reduce:transition-none",
    isOpen ? "duration-(--duration-base) ease-out" : "duration-(--duration-fast) ease-in",
  );
}

function itemClip(isOpen: boolean) {
  return cn(
    panelTransition(isOpen),
    isOpen
      ? "[clip-path:inset(-4px_-4px_-4px_-4px_round_16px)]"
      : "[clip-path:inset(-4px_152px_-4px_-4px_round_16px)]",
  );
}

/** Texto que entra con el panel: fundido + 6 px desde la izquierda, escalonado; al cerrar se va al instante. */
function revealClass(isOpen: boolean) {
  return cn(
    "transition-opacity motion-safe:transition-[opacity,translate]",
    isOpen
      ? "translate-x-0 opacity-100 duration-(--duration-base) ease-out"
      : "opacity-0 motion-safe:-translate-x-1.5 duration-(--duration-instant) ease-in",
  );
}

/** Retardo de entrada del texto del ítem `index`: 30 ms por ítem, con tope. Al cerrar, ninguno. */
function revealDelay(isOpen: boolean, index: number): CSSProperties | undefined {
  return isOpen ? { transitionDelay: `${60 + Math.min(index, 5) * 30}ms` } : undefined;
}

/**
 * El ítem mide 216 px (panel de 236 menos 2 × 10 de padding) pero cerrado solo se ven 60: el tooltip
 * se coloca desde el borde visible (14 px), no desde el borde real del enlace.
 */
const TOOLTIP_OFFSET = 14 - (216 - 60);

interface SidebarLinkProps {
  item: OrAppSidebarItem;
  index: number;
  isActive: boolean;
  isOpen: boolean;
}

function SidebarLink({ item, index, isActive, isOpen }: SidebarLinkProps) {
  // Cerrado, el nombre lo da el aria-label y el tooltip lo muestra (hover y foco de teclado).
  return (
    <AtTooltip content={item.label} isDisabled={isOpen} offset={TOOLTIP_OFFSET}>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-label={isOpen ? undefined : item.label}
        className={cn(
          "group flex h-[60px] w-full items-center gap-3 rounded-control px-3 transition-colors",
          isActive ? "bg-nav-active shadow-xs" : "hover:bg-background",
          itemClip(isOpen),
          FOCUS_RING,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-primary [&_svg]:size-5",
            isActive ? "bg-nav-active-icon-bg" : cn("bg-nav-icon-bg", ICON_LIFT),
          )}
        >
          {item.icon}
        </span>
        {/* Siempre montada; cerrada, fuera del árbol accesible (el nombre lo da el aria-label del enlace). */}
        <span
          aria-hidden={isOpen ? undefined : true}
          style={revealDelay(isOpen, index)}
          className={cn("flex min-w-0 flex-col", revealClass(isOpen))}
        >
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
      </Link>
    </AtTooltip>
  );
}

interface LogoutButtonProps {
  index: number;
  isOpen: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

/** Mismo aspecto que un ítem inactivo del menú, pero más bajo: es una acción, no una sección. */
function LogoutButton({ index, isOpen, isLoggingOut, onLogout }: LogoutButtonProps) {
  const label = isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión";

  return (
    <AtTooltip content={label} isDisabled={isOpen} offset={TOOLTIP_OFFSET}>
      <button
        type="button"
        onClick={isLoggingOut ? undefined : onLogout}
        // aria-disabled y no disabled: el foco no cae a <body> mientras se cierra la sesión.
        aria-disabled={isLoggingOut || undefined}
        aria-label={isOpen ? undefined : label}
        className={cn(
          "group flex h-12 w-full items-center gap-3 rounded-control px-3 text-muted transition-colors hover:bg-background",
          itemClip(isOpen),
          isLoggingOut && "cursor-wait opacity-70",
          FOCUS_RING,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-nav-icon-bg text-primary [&_svg]:size-5",
            !isLoggingOut && ICON_LIFT,
          )}
        >
          <LogOut />
        </span>
        <span
          aria-hidden={isOpen ? undefined : true}
          style={revealDelay(isOpen, index)}
          className={cn("truncate text-sm font-semibold leading-5", revealClass(isOpen))}
        >
          {label}
        </span>
      </button>
    </AtTooltip>
  );
}

export function OrAppSidebar({
  items,
  activeKey,
  isOpen,
  onToggle,
  onClose,
  user,
  homeHref = "/",
  onLogout,
  isLoggingOut = false,
  navId = "app-sidebar-nav",
  logoTransitionName = VIEW_TRANSITION_NAME.logo,
  className,
}: OrAppSidebarProps) {
  const panelRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  // El cierre más reciente, sin volver a suscribir los listeners en cada render.
  const closeRef = useRef(onClose ?? onToggle);

  useEffect(() => {
    closeRef.current = onClose ?? onToggle;
  });

  // Al navegar a otra ruta, se cierra.
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (isOpen) closeRef.current();
  }, [pathname, isOpen]);

  // Abierto (no es un modal: sin trampa de foco), un clic fuera o Esc lo cierran.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) closeRef.current();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeRef.current();
      menuButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Isotipo y logotipo montados y superpuestos: se cruzan con un fundido al ritmo del panel.
  const logo = (
    <span className="relative block h-[33px] w-[110px]">
      <Image
        src="/images/brand/logo-mark.png"
        alt=""
        width={25}
        height={33}
        preload
        className={cn(
          "absolute left-0 top-0 transition-[opacity,rotate,scale] motion-reduce:transition-none",
          isOpen
            ? "opacity-0 duration-(--duration-fast) ease-in"
            : cn(
              "opacity-100 duration-500 ease-spring",
              // Cerrado, el isotipo gira -8° y crece un poco al pasar.
              "motion-safe:group-hover:-rotate-8 motion-safe:group-hover:scale-108",
              "motion-safe:group-focus-visible:-rotate-8 motion-safe:group-focus-visible:scale-108",
            ),
        )}
      />
      <Image
        src="/images/brand/logo-ofibites.svg"
        alt=""
        width={110}
        height={32}
        preload
        className={cn(
          "absolute left-0 top-0.5 transition-opacity motion-reduce:transition-none",
          isOpen
            ? "opacity-100 delay-75 duration-(--duration-base) ease-out"
            : "opacity-0 duration-(--duration-instant) ease-in",
        )}
      />
    </span>
  );

  return (
    // Riel en el flujo: 80 px siempre. El panel (236 px) va encima del contenido.
    <div className={cn("relative z-30 h-full w-20 shrink-0", className)}>
      {/* Borde del riel cerrado; abierto, el borde es el del panel (a 236 px). */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-[79px] z-10 w-px bg-border-subtle",
          isOpen ? "opacity-0" : "opacity-100",
        )}
      />
      <aside
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 left-0 flex w-[236px] flex-col justify-between border-r border-border-subtle bg-content1 pt-8",
          panelTransition(isOpen),
          // Abierto, el recorte deja 48 px a la derecha para la sombra.
          isOpen ? "shadow-panel [clip-path:inset(0_-48px_0_0)]" : "[clip-path:inset(0_156px_0_0)]",
        )}
      >
        <div className="flex w-full flex-col gap-10">
          <div className="flex flex-col items-start gap-5">
            <Link
              href={homeHref}
              aria-label="Ofibites, ir al inicio"
              className={cn(
                "group ml-[27px] block rounded-sm",
                // Cerrado, el área del enlace es la del isotipo (no sale del riel).
                isOpen ? "w-[110px]" : "w-[25px]",
                FOCUS_RING,
              )}
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
              ref={menuButtonRef}
              isIconOnly
              size="sm"
              variant="light"
              color="default"
              className="ml-6 text-primary"
              aria-label={isOpen ? "Contraer menú" : "Expandir menú"}
              aria-expanded={isOpen}
              aria-controls={navId}
              onPress={onToggle}
            >
              <MenuMorphIcon isOpen={isOpen} />
            </AtButton>
          </div>

          <nav id={navId} aria-label="Principal" className="w-full px-2.5">
            <ul className="flex flex-col gap-5">
              {items.map((item, index) => (
                <li key={item.key}>
                  <SidebarLink
                    item={item}
                    index={index}
                    isActive={item.key === activeKey}
                    isOpen={isOpen}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex w-full shrink-0 flex-col">
          {onLogout && (
            <div className="w-full px-2.5 pb-3">
              <LogoutButton
                index={items.length}
                isOpen={isOpen}
                isLoggingOut={isLoggingOut}
                onLogout={onLogout}
              />
            </div>
          )}

          {user && (
            <div className="flex h-[84px] w-full shrink-0 items-center gap-[15px] border-t border-divider px-5 py-4">
              <Avatar
                src={user.avatarSrc}
                name={user.name}
                showFallback
                className="size-10 shrink-0"
                imgProps={{ alt: isOpen ? "" : user.name }}
              />
              <div
                aria-hidden={isOpen ? undefined : true}
                style={revealDelay(isOpen, items.length + 1)}
                className={cn("flex min-w-0 flex-col", revealClass(isOpen))}
              >
                <span className="truncate text-base font-semibold text-foreground">{user.name}</span>
                {user.role && <span className="truncate text-sm text-foreground">{user.role}</span>}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
