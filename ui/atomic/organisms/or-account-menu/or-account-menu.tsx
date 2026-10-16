"use client";

import { useState } from "react";
import Link from "next/link";

import { cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/react";
import { Building2, LoaderCircle, LogOut } from "lucide-react";

import { popoverMotionProps } from "@/shared/motion";
import { AtAvatar, AtChip } from "@/ui/atomic/atoms";

import { OrAccountMenuItem, OrAccountMenuProps } from "./or-account-menu.types";

const LOGOUT_KEY = "logout";

const ITEM_BASE = cn(
  "gap-2 rounded-[10px] px-2.5 py-[9px] text-foreground",
  "transition-colors duration-(--duration-fast) ease-out",
  "data-[hover=true]:bg-background data-[hover=true]:text-foreground",
  // `:focus-visible` del navegador y no `data-focus-visible`: HeroUI no pone el anillo en los ítems `isReadOnly`.
  "focus-visible:bg-background focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2",
);

/** Ítem sin pantalla: se enfoca con las flechas (se lee "no disponible"), pero no responde ni se ilumina. */
const ITEM_SOON = cn(
  "cursor-default text-muted",
  "data-[hover=true]:bg-transparent data-[hover=true]:text-muted",
  "focus-visible:bg-background",
);

/**
 * Menú de cuenta de la top bar (entrega `ofibites-dashboard.html`, `#meBtn` → `#mePop`): el avatar es el botón
 * ("Mi cuenta"); el panel lleva una cabecera con el nombre, el correo y la empresa activa, las opciones de la
 * cuenta y "Cerrar sesión".
 *
 * Es un `Dropdown` de HeroUI (react-aria `Menu`): `role="menu"`, flechas, Inicio/Fin, búsqueda por letra, Esc y
 * foco de vuelta al avatar. Un ítem sin `href` sale con `aria-disabled` y "Pronto"; se marca `isReadOnly` en vez
 * de `isDisabled` para que siga recibiendo el foco con las flechas (con `isDisabled`, react-aria lo salta y un
 * lector de pantalla nunca lo anunciaría).
 */
export function OrAccountMenu({
  user,
  items,
  onLogout,
  isLoggingOut = false,
  isOpen: isOpenProp,
  onOpenChange,
  id = "account-menu",
  className,
}: OrAccountMenuProps) {
  const [isOpenState, setIsOpenState] = useState(false);
  const isOpen = isOpenProp ?? isOpenState;
  const headerId = `${id}-header`;

  const setOpen = (open: boolean) => {
    if (isOpenProp === undefined) setIsOpenState(open);
    onOpenChange?.(open);
  };

  const renderItem = (item: OrAccountMenuItem) => {
    const isSoon = !item.href;
    return (
      <DropdownItem
        key={item.key}
        textValue={item.label}
        href={item.href}
        as={item.href ? Link : undefined}
        isReadOnly={isSoon}
        aria-disabled={isSoon || undefined}
        classNames={{ base: cn(ITEM_BASE, isSoon && ITEM_SOON), title: "text-[13px] leading-5" }}
      >
        {/* "Pronto" va dentro del título: forma parte del nombre accesible ("Mi perfil Pronto, no disponible"). */}
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{item.label}</span>
          {/* El espacio separa las palabras en el nombre accesible ("Mi perfil Pronto", no "Mi perfilPronto"). */}
          {isSoon && " "}
          {isSoon && <AtChip classNames={{ base: "shrink-0" }}>Pronto</AtChip>}
        </span>
      </DropdownItem>
    );
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setOpen}
      placement="bottom-end"
      offset={10}
      containerPadding={16}
      shouldBlockScroll={false}
      closeOnSelect={false}
      // Sin el `scale-[0.97]` + `opacity-70` que HeroUI pone al trigger abierto: la entrega no lo hace.
      triggerScaleOnOpen={false}
      motionProps={popoverMotionProps}
      classNames={{
        content: cn(
          // 256 px y no los 220 de la entrega: la cabecera (correo y empresa) no cabe en 220 sin cortarse.
          "w-64 min-w-64 max-w-[calc(100vw-32px)] p-2",
          "rounded-[18px] border-1 border-border-subtle bg-content1 text-foreground shadow-popover",
        ),
      }}
    >
      <DropdownTrigger>
        <button
          type="button"
          aria-label="Mi cuenta"
          className={cn(
            "shrink-0 rounded-full",
            // Entrega: crece a 1.06 con un anillo arena de 3 px; abierto, el anillo se queda.
            "transition-[scale,box-shadow] duration-(--duration-fast) ease-(--ease-spring)",
            "hover:scale-[1.06] hover:ring-3 hover:ring-surface-sand aria-expanded:ring-3 aria-expanded:ring-surface-sand",
            "motion-reduce:transition-[box-shadow] motion-reduce:hover:scale-100",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            className,
          )}
        >
          {/*
            El botón ya se llama "Mi cuenta": el avatar es decorativo. Sin `pointer-events`, porque el `Avatar` de
            HeroUI lleva `tabindex="-1"`: el clic lo enfocaría a él y, al cerrar, el foco volvería al avatar y no al
            botón.
          */}
          <AtAvatar src={user.avatarSrc} name={user.name} isDecorative className="pointer-events-none" />
        </button>
      </DropdownTrigger>

      <DropdownMenu
        aria-describedby={headerId}
        variant="flat"
        // El `Dropdown` va con `closeOnSelect={false}`: con secciones, HeroUI no encuentra el `closeOnSelect` del
        // ítem y cerraría también al pulsar "Cerrar sesión". Se cierra aquí salvo en ese caso.
        onAction={(key) => {
          if (key !== LOGOUT_KEY) setOpen(false);
          else if (!isLoggingOut) onLogout?.();
        }}
        topContent={
          <div id={headerId} className="flex flex-col gap-2 px-1 pb-2 pt-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <AtAvatar src={user.avatarSrc} name={user.name} isDecorative />
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-sm font-semibold leading-5 text-foreground" title={user.name}>
                  {user.name}
                </p>
                {user.email && (
                  <p className="line-clamp-2 break-all text-xs leading-4 text-subtle" title={user.email}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            {user.companyName && (
              <div className="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-background px-2.5 py-2">
                <Building2 aria-hidden="true" className="size-4 shrink-0 text-brand" />
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-xs font-semibold leading-4 text-foreground" title={user.companyName}>
                    {user.companyName}
                  </p>
                  {user.role && <p className="truncate text-[11px] leading-4 text-muted">{user.role}</p>}
                </div>
              </div>
            )}
          </div>
        }
        classNames={{ base: "p-0 gap-0", list: "gap-0.5" }}
      >
        <DropdownSection
          aria-label="Cuenta"
          items={items}
          showDivider={Boolean(onLogout)}
          classNames={{ base: "mb-0", divider: "my-1 bg-divider" }}
        >
          {renderItem}
        </DropdownSection>
        {onLogout ? (
          <DropdownSection aria-label="Sesión" classNames={{ base: "mb-0" }}>
            <DropdownItem
              key={LOGOUT_KEY}
              textValue="Cerrar sesión"
              // Abierto mientras se cierra la sesión: el ítem muestra el progreso hasta que `/login` sustituye la app.
              isReadOnly={isLoggingOut}
              aria-disabled={isLoggingOut || undefined}
              aria-busy={isLoggingOut || undefined}
              startContent={
                isLoggingOut ? (
                  <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
                ) : (
                  <LogOut aria-hidden="true" className="size-4 shrink-0" />
                )
              }
              classNames={{
                base: cn(ITEM_BASE, isLoggingOut && "cursor-wait text-muted data-[hover=true]:text-muted"),
                title: "text-[13px] leading-5",
              }}
            >
              {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </DropdownItem>
          </DropdownSection>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
