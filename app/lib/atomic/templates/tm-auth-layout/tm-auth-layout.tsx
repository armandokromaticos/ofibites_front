import Image from "next/image";

import { cn } from "@heroui/react";

import { TmAuthLayoutProps } from "./tm-auth-layout.types";

/** Ilustraciones de comida al 10 % (decoración del login del Figma). */
function AuthDecoration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
      {/* 505×412: caja fija + object-contain (con width/height redondeados, next/image avisa de aspecto alterado). */}
      <div className="absolute -left-16 -top-10 h-[206px] w-[253px] rotate-[18deg] opacity-10">
        <Image src="/images/decor/vegetal-4.png" alt="" fill sizes="253px" className="object-contain" />
      </div>
      <Image
        src="/images/decor/flat-3.png"
        alt=""
        width={343}
        height={140}
        className="absolute -bottom-6 -left-24 h-auto rotate-[12deg] opacity-10"
      />
      <Image
        src="/images/decor/flat-2.png"
        alt=""
        width={190}
        height={120}
        className="absolute left-[44%] top-6 hidden h-auto -rotate-[24deg] opacity-10 lg:block"
      />
      <Image
        src="/images/decor/vegetal-7.png"
        alt=""
        width={115}
        height={372}
        className="absolute -right-6 bottom-0 hidden h-auto opacity-10 sm:block lg:hidden"
      />
    </div>
  );
}

function AuthLogo() {
  return (
    <Image
      src="/images/brand/logo-ofibites-accent.svg"
      alt="Ofibites"
      width={162}
      height={48}
      className="mx-auto h-12 w-[162px]"
    />
  );
}

/**
 * Esqueleto de las pantallas de acceso: fondo crema con ilustraciones al 10 % y el logo naranja
 * centrado arriba del contenido.
 * - `split` (login): columna de 502 px y foto de 569×732 radio 22 sobre `surface-sand`. Sin diseño
 *   móvil en Figma: por debajo de `lg` se oculta la foto y la columna ocupa todo el ancho.
 * - `centered` (solicitud de ingreso): columna centrada de 673 px.
 */
export function TmAuthLayout({
  children,
  variant = "split",
  showLogo = true,
  imageSrc = "/images/auth/login-photo.webp",
  className,
}: TmAuthLayoutProps) {
  if (variant === "centered") {
    return (
      <div className={cn("relative isolate min-h-dvh overflow-hidden bg-background", className)}>
        <AuthDecoration />
        <div className="mx-auto flex min-h-dvh w-full max-w-[705px] flex-col justify-center px-4 py-10 sm:px-6 lg:py-14">
          <main className="flex w-full flex-col gap-12">
            {showLogo && <AuthLogo />}
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative isolate min-h-dvh overflow-hidden bg-background", className)}>
      <AuthDecoration />
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] items-center justify-center gap-12 px-4 py-10 sm:px-6 lg:justify-between lg:px-16 xl:px-[104px]">
        <main className="flex w-full max-w-[502px] flex-col gap-[60px]">
          {showLogo && <AuthLogo />}
          {children}
        </main>

        <div
          aria-hidden="true"
          className="relative hidden h-[min(732px,calc(100dvh-80px))] min-h-[520px] w-[569px] shrink-0 overflow-hidden rounded-card bg-surface-sand lg:block"
        >
          {/* Figma 3236:11719: la foto es la única capa sobre el surface-sand y llena el panel. */}
          <Image src={imageSrc} alt="" fill sizes="569px" preload className="object-cover" />
        </div>
      </div>
    </div>
  );
}
