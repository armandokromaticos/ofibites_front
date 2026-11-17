"use client";

import Image from "next/image";
import Link from "next/link";

import { AtButton, MlAuthHeader } from "@/ui/atomic";

/**
 * 404 global. No hay diseño en el Figma: se compone con las piezas de las pantallas de acceso (logo, `MlAuthHeader`
 * y CTA primario). Vive fuera de los layouts de área, así que no depende de la sesión. El CTA va a `/dashboard`
 * (la guarda del grupo cliente manda a `/login` sin sesión y a `/` a los roles de plataforma); `/` sigue siendo
 * la página en construcción. Es cliente porque el barrel `@/ui/atomic` no se puede importar desde un server
 * component (HeroUI llama a `createContext`).
 */
export function PaginaNoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-4 py-10">
      <Link
        href="/dashboard"
        className="rounded-control outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Image
          src="/images/brand/logo-ofibites-accent.svg"
          alt="Ofibites, ir al inicio"
          width={162}
          height={48}
          className="h-12 w-[162px]"
        />
      </Link>

      <section className="relative w-full max-w-[480px] overflow-hidden rounded-card bg-content1 px-6 py-10 sm:px-10 sm:py-12">
        {/* Decoración vegetal al 6 %, como los banners: nunca contenido. */}
        <Image
          src="/images/decor/vegetal-4.png"
          alt=""
          aria-hidden="true"
          width={220}
          height={220}
          className="pointer-events-none absolute -right-12 -top-10 w-[220px] select-none opacity-[0.06]"
        />

        <div className="relative flex flex-col items-center gap-8 text-center">
          <MlAuthHeader
            icon={
              <span className="flex flex-col items-center gap-3">
                <span
                  aria-hidden="true"
                  className="font-display text-[88px] font-black leading-none tracking-[-0.04em] text-surface-sand sm:text-[112px]"
                >
                  404
                </span>
                <span className="rounded-full bg-surface-sand px-3 py-0.5 text-xs font-semibold leading-5 text-brand">
                  Error 404
                </span>
              </span>
            }
            title="No encontramos esta página"
            subtitle={
              <span className="block max-w-[38ch] text-pretty text-sm font-medium leading-[22px] text-muted">
                Puede que el enlace esté mal escrito o que la página ya no exista. Vuelve al inicio y
                sigue desde ahí.
              </span>
            }
          />

          <AtButton as={Link} href="/dashboard" size="lg" className="w-full sm:w-auto sm:min-w-[240px]">
            Volver al inicio
          </AtButton>
        </div>
      </section>
    </main>
  );
}
