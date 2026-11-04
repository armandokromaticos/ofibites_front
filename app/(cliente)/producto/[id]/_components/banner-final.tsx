"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";
import { Plus } from "lucide-react";

import { useLoopActive } from "@/shared/motion/hooks";
import { AtButton } from "@/ui/atomic";

import { RUTA_ORDENAR } from "../../../_navegacion";

/**
 * Banner "Coffee Break Box premium" al pie de la ficha (Figma 3163:3106): fondo `brand-soft` con la composición de
 * cajas a los lados (`detalle-producto-final.png`, decorativa) y el texto centrado. Por debajo de `md` las cajas
 * taparían el texto: solo queda el fondo.
 *
 * Movimiento, como la decoración del banner principal del Dashboard: las cajas derivan muy despacio (`ofi-drift`,
 * 18 s ida y vuelta) solo mientras el banner se ve, y crecen un poco al pasar sobre él. El contenedor sobresale
 * 16 px por cada lado para que la deriva no destape los bordes. Con movimiento reducido, quietas.
 */
export function BannerFinal() {
  const sectionRef = useRef<HTMLElement>(null);
  const isDrifting = useLoopActive(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ficha-banner"
      className="group/banner relative isolate flex min-h-[266px] items-center justify-center overflow-hidden rounded-card bg-brand-soft px-6 py-10"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden md:block">
        <div className={cn("absolute -inset-4", isDrifting && "ofi-drift")}>
          <div
            className={cn(
              "absolute inset-0",
              "motion-safe:transition-[scale] motion-safe:duration-(--duration-focal) motion-safe:ease-out",
              "motion-safe:group-hover/banner:scale-103",
            )}
          >
            <Image
              src="/images/banners/detalle-producto-final.png"
              alt=""
              fill
              sizes="(min-width: 1280px) 1328px, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-[331px] flex-col items-center gap-[17px] text-center">
        <h2
          id="ficha-banner"
          className="text-balance font-display text-[38px] font-black leading-[1] tracking-[-0.04em] text-brand sm:text-[47px]"
        >
          Coffee Break Box premium
        </h2>
        <p className="text-pretty text-[13px] font-semibold leading-[17px] text-foreground">
          Elige la combinación ideal para las reuniones, eventos y pausas de tu equipo.
        </p>
        <AtButton
          as={Link}
          href={RUTA_ORDENAR}
          size="md"
          className="w-full"
          startContent={<Plus aria-hidden="true" className="size-[15px]" strokeWidth={2.5} />}
        >
          Ordenar ahora
        </AtButton>
      </div>
    </section>
  );
}
