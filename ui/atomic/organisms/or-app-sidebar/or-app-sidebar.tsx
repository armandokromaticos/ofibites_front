"use client";

import {
  CSSProperties,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@heroui/react";
import { LogOut } from "lucide-react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { AtAvatar, AtButton, AtChip, AtMenuIcon, AtTooltip } from "@/ui/atomic/atoms";

import {
  OrAppSidebarDrawerCloseReason,
  OrAppSidebarItem,
  OrAppSidebarProps,
} from "./or-app-sidebar.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Icono de un ítem inactivo: sube 2 px al pasar o enfocar (microfeedback, curva spring). */
const ICON_LIFT = cn(
  "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-spring",
  "motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:-translate-y-0.5",
);

/*
 * Panel superpuesto (Figma "Sidebar" 2308:24770): en el flujo el sidebar ocupa siempre el riel de 80 px; el
 * panel de 304 px va encima del contenido y se descubre con `clip-path` (no `width`), así la página no se
 * reflowea al abrir. Abrir: 320 ms ease-out. Cerrar: 200 ms ease-in. Con movimiento reducido el recorte
 * cambia al instante y las etiquetas solo se funden.
 *
 * Cada ítem mide 216 px (la tarjeta del activo del Figma) a 10 px del borde y lleva su propio recorte,
 * sincronizado con el del panel: cerrado se ve el cuadrado de 60 px (x 10-70, centrado en el riel), abierto
 * la tarjeta completa. El icono (caja de 36 px a 12 px del borde del ítem, x 22-58) no se mueve nunca.
 */
function panelTransition(isOpen: boolean) {
  return cn(
    "transition-[clip-path,box-shadow] motion-reduce:transition-none",
    isOpen
      ? "duration-(--duration-base) ease-out"
      : "duration-(--duration-fast) ease-in",
  );
}

function itemClip(isOpen: boolean) {
  // Cerrado: el recorte es el cuadrado de 60 × 60 (216 − 156) centrado en vertical (el ítem mide 60 o 76 según
  // las líneas de la descripción) con su radio de 12 px (`rounded-control`), como el activo del Figma cerrado.
  // Abierto y con foco de teclado se abren 4 px por cada lado para no cortar el anillo.
  return cn(
    panelTransition(isOpen),
    isOpen
      ? "[clip-path:inset(-4px_-4px_-4px_-4px_round_16px)]"
      : "[clip-path:inset(calc(50%_-_30px)_156px_calc(50%_-_30px)_0px_round_12px)] focus-visible:[clip-path:inset(calc(50%_-_34px)_152px_calc(50%_-_34px)_-4px_round_16px)]",
  );
}

/** Tarjeta del ítem (Figma: activo de 216 × 76, padding 12, radio 12); el alto lo dan icono y texto. */
const ITEM_BOX =
  "group flex items-center gap-3 p-3 rounded-control w-[216px] min-h-[60px] text-left transition-colors";

/** Caja del icono: 36 × 36, radio 8, icono de 20 px. */
const ICON_BOX =
  "flex justify-center items-center rounded-lg size-9 [&_svg]:size-5 shrink-0";

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
function revealDelay(
  isOpen: boolean,
  index: number,
): CSSProperties | undefined {
  return isOpen
    ? { transitionDelay: `${60 + Math.min(index, 5) * 30}ms` }
    : undefined;
}

/**
 * El ítem mide 216 px pero cerrado solo se ven 60: el tooltip se coloca desde el borde visible (14 px), no
 * desde el borde real del enlace.
 */
const TOOLTIP_OFFSET = 14 - (216 - 60);

interface SidebarLinkProps {
  item: OrAppSidebarItem;
  index: number;
  isActive: boolean;
  isOpen: boolean;
  /** Drawer móvil: al pulsar un enlace se cierra (también si lleva a la ruta actual). */
  onNavigate?: () => void;
}

function SidebarLink({
  item,
  index,
  isActive,
  isOpen,
  onNavigate,
}: SidebarLinkProps) {
  // Al elegir el ítem el cursor (o el foco) sigue encima: sin esto, el tooltip seguía abierto al arrancar la
  // transición de página y se veía debajo de la página que entra. Se cierra al pulsar y no vuelve a abrirse
  // hasta que el cursor sale del ítem o el foco lo deja.
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const tooltipSuprimido = useRef(false);
  const liberarTooltip = () => {
    tooltipSuprimido.current = false;
  };

  if (!item.href) return <SidebarSoonItem item={item} index={index} isOpen={isOpen} />;

  // Cerrado, el nombre lo da el aria-label y el tooltip lo muestra (hover y foco de teclado).
  return (
    <AtTooltip
      content={item.label}
      isDisabled={isOpen}
      offset={TOOLTIP_OFFSET}
      isOpen={isTooltipOpen}
      onOpenChange={(abierto) => setIsTooltipOpen(abierto && !tooltipSuprimido.current)}
    >
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-label={isOpen ? undefined : item.label}
        onClick={() => {
          tooltipSuprimido.current = true;
          setIsTooltipOpen(false);
          onNavigate?.();
        }}
        onPointerLeave={liberarTooltip}
        onBlur={liberarTooltip}
        className={cn(
          ITEM_BOX,
          isActive ? "bg-nav-active shadow-xs" : "hover:bg-background",
          itemClip(isOpen),
          FOCUS_RING,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            ICON_BOX,
            isActive
              ? "bg-nav-active-icon-bg text-white"
              : cn("bg-nav-icon-bg text-primary", ICON_LIFT),
          )}
        >
          {item.icon}
        </span>
        {/*
         * Siempre montada; cerrada, fuera del árbol accesible (el nombre lo da el aria-label del enlace).
         * 128 px de ancho, como en el Figma: la descripción corta en dos líneas ("Resumen y pedidos / en curso").
         */}
        <span
          aria-hidden={isOpen ? undefined : true}
          style={revealDelay(isOpen, index)}
          className={cn("flex flex-col w-32 min-w-0", revealClass(isOpen))}
        >
          <span
            className={cn(
              "text-sm truncate leading-5",
              isActive
                ? "font-extrabold text-foreground"
                : "font-semibold text-muted",
            )}
          >
            {item.label}
          </span>
          {item.description && (
            <span
              className={cn(
                "text-xs leading-4",
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

interface SidebarSoonItemProps {
  item: OrAppSidebarItem;
  index: number;
  isOpen: boolean;
}

/**
 * Ítem sin `href` (sección del Figma aún sin pantalla): mismo aspecto que un inactivo, con el icono atenuado, sin
 * hover y con el chip "Próximamente" bajo la descripción (junto al título no cabe en los 128 px). Es un enlace
 * deshabilitado (`role="link"` + `aria-disabled`, sin `href` ni acción): enfocable para que el tooltip y el nombre
 * se anuncien, como las opciones "Próximamente" del menú de cuenta. Pulsarlo no navega ni cierra el drawer, y
 * nunca se marca activo.
 */
function SidebarSoonItem({ item, index, isOpen }: SidebarSoonItemProps) {
  return (
    <AtTooltip content={`${item.label} · Próximamente`} isDisabled={isOpen} offset={TOOLTIP_OFFSET}>
      <span
        role="link"
        tabIndex={0}
        aria-disabled="true"
        aria-label={isOpen ? undefined : `${item.label}, Próximamente`}
        className={cn(ITEM_BOX, "cursor-default", itemClip(isOpen), FOCUS_RING)}
      >
        <span aria-hidden="true" className={cn(ICON_BOX, "bg-nav-icon-bg text-primary opacity-50")}>
          {item.icon}
        </span>
        {/* Abierto, el nombre sale del contenido ("Facturas Facturas y pagos Próximamente"). */}
        <span
          aria-hidden={isOpen ? undefined : true}
          style={revealDelay(isOpen, index)}
          className={cn("flex flex-col items-start w-32 min-w-0", revealClass(isOpen))}
        >
          <span className="w-full font-semibold text-muted text-sm truncate leading-5">{item.label}</span>
          {/* Los espacios separan las palabras en el nombre accesible. */}{" "}
          {item.description && <span className="text-subtle text-xs leading-4">{item.description}</span>}{" "}
          <AtChip classNames={{ base: "mt-1 shrink-0" }}>Próximamente</AtChip>
        </span>
      </span>
    </AtTooltip>
  );
}

interface LogoutButtonProps {
  index: number;
  isOpen: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

/** Mismo aspecto que un ítem inactivo del menú, con una sola línea (60 px de alto): es una acción, no una sección. */
function LogoutButton({
  index,
  isOpen,
  isLoggingOut,
  onLogout,
}: LogoutButtonProps) {
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
          ITEM_BOX,
          "hover:bg-background text-muted",
          itemClip(isOpen),
          isLoggingOut && "cursor-wait opacity-70",
          FOCUS_RING,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            ICON_BOX,
            "bg-nav-icon-bg text-primary",
            !isLoggingOut && ICON_LIFT,
          )}
        >
          <LogOut />
        </span>
        <span
          aria-hidden={isOpen ? undefined : true}
          style={revealDelay(isOpen, index)}
          className={cn(
            "font-semibold text-sm truncate leading-5",
            revealClass(isOpen),
          )}
        >
          {label}
        </span>
      </button>
    </AtTooltip>
  );
}

const FOCUSABLE =
  "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

/** Por debajo de 768 px no hay riel: el panel sale como drawer desde la top bar. */
const DRAWER_QUERY = "(max-width: 767.98px)";

interface SidebarPanelProps extends Pick<
  OrAppSidebarProps,
  "items" | "activeKey" | "user" | "onLogout" | "isLoggingOut" | "homeHref"
> {
  isOpen: boolean;
  navId: string;
  logoTransitionName: string | null;
  /** Botón bajo el logo: expandir/contraer en el riel, cerrar en el drawer. */
  menuButton: ReactNode;
  onNavigate?: () => void;
}

/** Contenido del panel (logo, menú, cerrar sesión y usuario), compartido por el riel y el drawer. */
function SidebarPanel({
  items,
  activeKey,
  user,
  onLogout,
  isLoggingOut = false,
  homeHref = "/",
  isOpen,
  navId,
  logoTransitionName,
  menuButton,
  onNavigate,
}: SidebarPanelProps) {
  // Isotipo y logotipo montados y superpuestos: se cruzan con un fundido al ritmo del panel.
  const logo = (
    <span className="block relative w-[114px] h-[33px]">
      <Image
        src="/images/brand/logo-mark.png"
        alt=""
        width={25}
        height={33}
        preload
        className={cn(
          "top-0 left-0 absolute transition-[opacity,rotate,scale] motion-reduce:transition-none",
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
      {/* Logotipo 4 px a la derecha del isotipo: x 31 abierto, como en el Figma (el isotipo, centrado en el riel). */}
      <Image
        src="/images/brand/logo-ofibites.svg"
        alt=""
        width={110}
        height={32}
        preload
        className={cn(
          "top-0.5 left-1 absolute transition-opacity motion-reduce:transition-none",
          isOpen
            ? "opacity-100 delay-75 duration-(--duration-base) ease-out"
            : "opacity-0 duration-(--duration-instant) ease-in",
        )}
      />
    </span>
  );

  return (
    <>
      {/*
       * Figma: 40 px entre la cabecera y el primer ítem visible. Aquí, 22 px hasta la caja del ítem (que lleva
       * 12 px de padding) desde el botón de menú (que deja 6 px bajo su icono): 6 + 22 + 12 = 40.
       */}
      <div className="flex flex-col gap-[22px] w-full shrink-0">
        {/* Logo (33 px) y botón de menú de 32 px: 14 + 6 de su padding = los 20 px del Figma hasta el icono. */}
        <div className="flex flex-col items-start gap-3.5">
          <Link
            href={homeHref}
            aria-label="Ofibites, ir al inicio"
            onClick={onNavigate}
            className={cn(
              "group block ml-[27px] rounded-sm",
              // Cerrado, el área del enlace es la del isotipo (no sale del riel).
              isOpen ? "w-[114px]" : "w-[25px]",
              FOCUS_RING,
            )}
          >
            {/* Mismo nombre que el logo de las pantallas de acceso: tras el login, viaja hasta aquí. */}
            {logoTransitionName ? (
              <ViewTransition
                name={logoTransitionName}
                share={VIEW_TRANSITION_CLASS.shared}
              >
                {logo}
              </ViewTransition>
            ) : (
              logo
            )}
          </Link>
          {menuButton}
        </div>

        <nav id={navId} aria-label="Principal" className="px-2.5 w-full">
          {/*
           * Figma: ~21 px entre ítems. Con la caja de 12 px de padding (para el hover y el activo), 4 px entre
           * cajas dan 28 px entre textos y 16 px entre la tarjeta activa y el texto vecino. Sustituye a los ítems
           * compactos de 48 px de T-35; si no caben, el panel hace scroll.
           */}
          <ul className="flex flex-col gap-1">
            {items.map((item, index) => (
              <li key={item.key}>
                <SidebarLink
                  item={item}
                  index={index}
                  isActive={item.key === activeKey}
                  isOpen={isOpen}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col w-full shrink-0">
        {onLogout && (
          <div className="px-2.5 pt-4 pb-3 w-full">
            <LogoutButton
              index={items.length}
              isOpen={isOpen}
              isLoggingOut={isLoggingOut}
              onLogout={onLogout}
            />
          </div>
        )}

        {user && (
          <div className="flex items-center gap-[15px] px-5 py-4 border-border-subtle border-t w-full h-[84px] shrink-0">
            {/* Abierto, el nombre se lee al lado: el avatar no lo repite. */}
            <AtAvatar
              src={user.avatarSrc}
              name={user.name}
              isDecorative={isOpen}
            />
            <div
              aria-hidden={isOpen ? undefined : true}
              style={revealDelay(isOpen, items.length + 1)}
              className={cn("flex flex-col min-w-0", revealClass(isOpen))}
            >
              <span className="font-semibold text-foreground text-base truncate">
                {user.name}
              </span>
              {user.role && (
                <span className="text-foreground text-sm truncate">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Mantiene el Tab dentro de `container` (drawer modal). Escucha en `document`: también cubre el foco que
 * esté fuera del drawer (en `<body>` tras un clic en zona no enfocable, por ejemplo).
 */
function trapTab(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return;
  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE),
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (active === last || !container.contains(active))
  ) {
    event.preventDefault();
    first.focus();
  }
}

type CloseDrawer = (reason: OrAppSidebarDrawerCloseReason) => void;

/** Drawer abierto: Esc, trampa de Tab, scroll del body bloqueado, foco inicial y cierre si crece a tablet. */
function useDrawerEffects(
  isOpen: boolean,
  closeRef: RefObject<CloseDrawer>,
  drawerRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    initialFocusRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current("escape");
      else trapTab(event, drawerRef.current);
    };
    const media = window.matchMedia(DRAWER_QUERY);
    const handleMediaChange = () => {
      if (!media.matches) closeRef.current("resize");
    };
    document.addEventListener("keydown", handleKeyDown);
    media.addEventListener("change", handleMediaChange);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
      media.removeEventListener("change", handleMediaChange);
    };
  }, [isOpen, closeRef, drawerRef, initialFocusRef]);
}

const NOOP: CloseDrawer = () => {};

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
  drawer,
  tourId,
  className,
}: OrAppSidebarProps) {
  const panelRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  // Los cierres más recientes, sin volver a suscribir los listeners en cada render.
  const closeRef = useRef(onClose ?? onToggle);
  const closeDrawerRef = useRef<CloseDrawer>(drawer?.onClose ?? NOOP);
  const isDrawerOpen = drawer?.isOpen ?? false;

  useEffect(() => {
    closeRef.current = onClose ?? onToggle;
    closeDrawerRef.current = drawer?.onClose ?? NOOP;
  });

  // Al navegar a otra ruta, se cierran el panel y el drawer.
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (isOpen) closeRef.current();
    if (isDrawerOpen) closeDrawerRef.current("navigate");
  }, [pathname, isOpen, isDrawerOpen]);

  // Riel abierto (no es un modal: sin trampa de foco), un clic fuera o Esc lo cierran.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) closeRef.current();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
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

  useDrawerEffects(
    isDrawerOpen,
    closeDrawerRef,
    drawerRef,
    drawerCloseButtonRef,
  );

  const panelProps = {
    items,
    activeKey,
    user,
    onLogout,
    isLoggingOut,
    homeHref,
  };

  return (
    // Desde tablet, riel en el flujo de 80 px y panel de 304 px encima del contenido. En móvil no hay
    // riel (ancho 0): el mismo panel sale como drawer desde la top bar (`drawer`).
    <div
      data-tour={tourId}
      className={cn("z-30 relative md:w-20 h-full shrink-0", className)}
    >
      {/* Borde del riel cerrado; abierto, el borde es el del panel (a 304 px). */}
      <span
        aria-hidden="true"
        className={cn(
          "hidden md:block left-[79px] z-10 absolute inset-y-0 bg-border-subtle w-px pointer-events-none",
          isOpen ? "opacity-0" : "opacity-100",
        )}
      />
      <aside
        ref={panelRef}
        className={cn(
          // 304 px; cerrado se recortan 224 y queda el riel de 80. Si la ventana es baja, el panel hace scroll.
          "hidden left-0 absolute inset-y-0 md:flex flex-col justify-between overflow-y-auto overscroll-contain bg-content1 pt-8 border-border-subtle border-r w-[304px]",
          panelTransition(isOpen),
          // Abierto, el recorte deja 48 px a la derecha para la sombra.
          isOpen
            ? "shadow-panel [clip-path:inset(0_-48px_0_0)]"
            : "[clip-path:inset(0_224px_0_0)]",
        )}
      >
        <SidebarPanel
          {...panelProps}
          isOpen={isOpen}
          navId={navId}
          logoTransitionName={logoTransitionName}
          menuButton={
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
              <AtMenuIcon isOpen={isOpen} />
            </AtButton>
          }
        />
      </aside>

      {drawer && (
        /*
         * Drawer modal (< 768 px): el mismo panel, siempre en su estado abierto. Entra desde la izquierda en
         * 320 ms ease-out y sale en 200 ms ease-in; con movimiento reducido, solo un fundido. Cerrado queda
         * `inert` y, al terminar la salida, `invisible`: fuera del orden de foco y del árbol accesible.
         */
        <div
          inert={!isDrawerOpen}
          className={cn(
            "md:hidden z-50 fixed inset-0",
            isDrawerOpen
              ? "visible"
              : "pointer-events-none invisible transition-[visibility] duration-(--duration-fast)",
          )}
        >
          {/* Scrim: `primary` al 25 % con 2 px de desenfoque. Un clic lo cierra. */}
          <div
            aria-hidden="true"
            onClick={() => closeDrawerRef.current("scrim")}
            style={
              isDrawerOpen
                ? { viewTransitionName: VIEW_TRANSITION_NAME.appDrawerScrim }
                : {}
            }
            className={cn(
              "absolute inset-0 bg-primary/25 backdrop-blur-[2px] transition-opacity",
              isDrawerOpen
                ? "opacity-100 duration-(--duration-base) ease-out"
                : "opacity-0 duration-(--duration-fast) ease-in",
            )}
          />
          <aside
            ref={drawerRef}
            id={drawer.id ?? "app-sidebar-drawer"}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            // Nombre propio solo abierto: en una navegación queda por encima de la página que entra.
            style={
              isDrawerOpen
                ? { viewTransitionName: VIEW_TRANSITION_NAME.appDrawer }
                : undefined
            }
            className={cn(
              "left-0 absolute inset-y-0 flex flex-col justify-between gap-6 w-[304px] max-w-[85vw]",
              "overflow-y-auto overscroll-contain border-r border-border-subtle bg-content1 pt-8 shadow-panel",
              "motion-safe:transition-[translate] motion-reduce:transition-opacity",
              isDrawerOpen
                ? "translate-x-0 opacity-100 duration-(--duration-base) ease-out"
                : "duration-(--duration-fast) ease-in motion-safe:-translate-x-full motion-reduce:opacity-0",
            )}
          >
            <SidebarPanel
              {...panelProps}
              isOpen
              navId={`${navId}-movil`}
              // El nombre de View Transition del logo ya lo lleva el riel (solo puede estar una vez).
              logoTransitionName={null}
              onNavigate={() => closeDrawerRef.current("navigate")}
              menuButton={
                <AtButton
                  ref={drawerCloseButtonRef}
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="default"
                  className="ml-6 text-primary"
                  aria-label="Cerrar menú"
                  onPress={() => closeDrawerRef.current("button")}
                >
                  <AtMenuIcon isOpen />
                </AtButton>
              }
            />
          </aside>
        </div>
      )}
    </div>
  );
}
