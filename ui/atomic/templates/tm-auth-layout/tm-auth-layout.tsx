import { ReactNode, ViewTransition } from "react";
import Image from "next/image";

import { cn } from "@heroui/react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";

import { TmAuthLayoutProps } from "./tm-auth-layout.types";

/** Ilustraciones de comida al 10 % (decoración del login del Figma). */
function AuthDecoration() {
  return (
    <div
      aria-hidden="true"
      className="-z-10 absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      {/* 505×412: caja fija + object-contain (con width/height redondeados, next/image avisa de aspecto alterado). */}
      <div className="-top-10 -left-16 absolute opacity-10 w-[253px] h-[206px] rotate-[18deg]">
        <Image
          src="/images/decor/vegetal-4.png"
          alt=""
          fill
          sizes="253px"
          className="object-contain"
        />
      </div>
      <Image
        src="/images/decor/flat-3.png"
        alt=""
        width={343}
        height={140}
        className="-bottom-6 -left-24 absolute opacity-10 h-auto rotate-[12deg]"
      />
      <Image
        src="/images/decor/flat-2.png"
        alt=""
        width={190}
        height={120}
        className="hidden lg:block top-6 left-[44%] absolute opacity-10 h-auto -rotate-[24deg]"
      />
      <Image
        src="/images/decor/vegetal-7.png"
        alt=""
        width={115}
        height={372}
        className="hidden lg:hidden sm:block -right-6 bottom-0 absolute opacity-10 h-auto"
      />
    </div>
  );
}

function AuthLogo() {
  return (
    <ViewTransition
      name={VIEW_TRANSITION_NAME.logo}
      share={VIEW_TRANSITION_CLASS.shared}
    >
      <Image
        src="/images/brand/logo-ofibites-accent.svg"
        alt="Ofibites"
        width={162}
        height={48}
        className="mx-auto w-[162px] h-12"
      />
    </ViewTransition>
  );
}

/** Columna del formulario: es el mismo elemento en todas las pantallas de acceso y se desliza entre ellas. */
function AuthPanel({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <ViewTransition
      name={VIEW_TRANSITION_NAME.authPanel}
      share={VIEW_TRANSITION_CLASS.shared}
      default={VIEW_TRANSITION_CLASS.page}
    >
      <main className={className}>{children}</main>
    </ViewTransition>
  );
}

/**
 * Esqueleto de las pantallas de acceso: fondo crema con ilustraciones al 10 % y el logo naranja
 * centrado arriba del contenido.
 * - `split` (login v1): fondo `iniciar-sesion-bg` y columna centrada de 502 px.
 * - `centered` (solicitud de ingreso, recuperar y restablecer contraseña): columna centrada de 673 px.
 *
 * Entre rutas, la página entra con fundido y desplazamiento corto; el logo y la columna del
 * formulario son elementos compartidos (View Transitions).
 */
export function TmAuthLayout({
  children,
  variant = "split",
  showLogo = true,
  backgroundSrc,
  contentClassName,
  className,
}: TmAuthLayoutProps) {
  if (variant === "centered") {
    return (
      <ViewTransition default={VIEW_TRANSITION_CLASS.page}>
        <div
          className={cn(
            "isolate relative bg-background min-h-dvh overflow-hidden",
            className,
          )}
        >
          {backgroundSrc ? (
            <Image
              src={backgroundSrc}
              alt=""
              fill
              sizes="100vw"
              preload
              className="-z-10 object-cover pointer-events-none select-none"
            />
          ) : (
            <AuthDecoration />
          )}
          <div
            className={cn(
              "flex flex-col justify-center mx-auto px-4 sm:px-6 py-10 lg:py-14 w-full max-w-[705px] min-h-dvh",
              contentClassName,
            )}
          >
            <AuthPanel className="flex flex-col gap-12 w-full">
              {showLogo && <AuthLogo />}
              {children}
            </AuthPanel>
          </div>
        </div>
      </ViewTransition>
    );
  }

  return (
    <ViewTransition default={VIEW_TRANSITION_CLASS.page}>
      <div
        className={cn("isolate relative min-h-dvh overflow-hidden", className)}
      >
        <Image
          src="/images/auth/iniciar-sesion-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover"
          priority
        />
        <AuthDecoration />
        <div className="flex justify-center items-center mx-auto px-4 sm:px-6 py-10 w-full min-h-dvh">
          <AuthPanel className="flex flex-col items-center gap-[60px] w-full max-w-[502px] text-center">
            {showLogo && <AuthLogo />}
            {children}
          </AuthPanel>
        </div>
      </div>
    </ViewTransition>
  );
}
