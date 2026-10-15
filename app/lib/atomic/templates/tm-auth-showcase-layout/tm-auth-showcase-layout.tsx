"use client";

import { FocusEvent, useState, ViewTransition } from "react";
import Image from "next/image";

import { cn } from "@heroui/react";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";

import { TmAuthShowcaseLayoutProps } from "./tm-auth-showcase-layout.types";

const FIELD_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isField(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && FIELD_TAGS.has(target.tagName);
}

/**
 * Acceso con vitrina (login v2): formulario a la izquierda (≈45 %) y, a la derecha, una vitrina a
 * toda la altura de la ventana que acompaña al desplazamiento. Por debajo de `lg` la vitrina pasa a
 * una franja arriba y el formulario queda debajo, a todo el ancho.
 *
 * El logo y la columna del formulario comparten nombre de View Transition con `TmAuthLayout`: al ir
 * a recuperar la contraseña o a la solicitud, la columna se desliza a su nueva posición.
 */
export function TmAuthShowcaseLayout({ children, showcase, className }: TmAuthShowcaseLayoutProps) {
  const [isFieldFocused, setIsFieldFocused] = useState(false);

  const handleFocus = (event: FocusEvent<HTMLElement>) => setIsFieldFocused(isField(event.target));
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!isField(event.relatedTarget)) setIsFieldFocused(false);
  };

  return (
    <ViewTransition default={VIEW_TRANSITION_CLASS.page}>
      <div className={cn("flex min-h-dvh flex-col bg-background lg:flex-row", className)}>
        <div className="order-first pt-6 lg:sticky lg:top-0 lg:order-last lg:h-dvh lg:w-[55%] lg:shrink-0 lg:pt-0 lg:pr-6">
          {showcase({ paused: isFieldFocused })}
        </div>

        <div className="flex flex-1 justify-center px-4 pt-10 pb-12 sm:px-6 lg:items-center lg:px-12 lg:pt-8 lg:pb-[8vh] xl:px-20">
          <ViewTransition
            name={VIEW_TRANSITION_NAME.authPanel}
            share={VIEW_TRANSITION_CLASS.shared}
            default={VIEW_TRANSITION_CLASS.page}
          >
            <main
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="flex w-full max-w-[440px] flex-col gap-10 lg:gap-12"
            >
              <ViewTransition name={VIEW_TRANSITION_NAME.logo} share={VIEW_TRANSITION_CLASS.shared}>
                <Image
                  src="/images/brand/logo-ofibites-accent.svg"
                  alt="Ofibites"
                  width={162}
                  height={48}
                  className="h-12 w-[162px]"
                />
              </ViewTransition>
              {children}
            </main>
          </ViewTransition>
        </div>
      </div>
    </ViewTransition>
  );
}
