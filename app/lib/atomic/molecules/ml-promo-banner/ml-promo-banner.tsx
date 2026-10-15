"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";
import { ArrowRight } from "lucide-react";

import { useLoopActive } from "@/shared/motion/hooks";
import { AtButton } from "@/app/lib/atomic/atoms";

import { MlPromoBannerProps } from "./ml-promo-banner.types";

/**
 * Ilustraciones vegetales al 3-5 % de opacidad (decoración del Figma, nodo 3216:28251).
 * Las ilustraciones derivan muy despacio (18 s, ida y vuelta) solo mientras el banner se ve; la forma
 * verde gira un poco al pasar sobre el banner.
 */
function MainDecoration({ isDrifting }: { isDrifting: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden select-none sm:block">
      <div className={cn("absolute inset-0", isDrifting && "ofi-drift")}>
        {/* El PNG es 344×1115: el Figma lo recorta (object-cover) a una caja de 144×298. */}
        <div className="absolute left-[-17px] top-[50px] h-[298px] w-[144px] rotate-[179.3deg] -scale-y-100 overflow-hidden opacity-5">
          <Image src="/images/decor/vegetal-7.png" alt="" fill sizes="144px" className="object-cover" />
        </div>
        <Image
          src="/images/decor/flat-3.png"
          alt=""
          width={278}
          height={113}
          className="absolute left-[165px] top-[90px] -rotate-90 opacity-5"
        />
        <Image
          src="/images/decor/vegetal-4.png"
          alt=""
          width={223}
          height={182}
          className="absolute left-[431px] top-[-40px] rotate-[18.1deg] -scale-y-100 opacity-5"
        />
        <Image
          src="/images/decor/flat-2.png"
          alt=""
          width={142}
          height={90}
          className="absolute left-[494px] top-[248px] rotate-[68.22deg] opacity-5"
        />
      </div>
      {/* Forma verde detrás de la imagen, recortada al tercio derecho del banner. */}
      <div className="absolute inset-y-0 right-0 w-[326px] overflow-hidden">
        <Image
          src="/images/decor/banner-blob.svg"
          alt=""
          width={622}
          height={622}
          className={cn(
            "absolute left-[-72px] top-[-164px] max-w-none -rotate-[14.56deg]",
            "motion-safe:transition-[rotate,scale] motion-safe:duration-(--duration-focal) motion-safe:ease-out",
            "motion-safe:group-hover/banner:-rotate-[18.56deg] motion-safe:group-hover/banner:scale-104",
          )}
        />
      </div>
    </div>
  );
}

function SecondaryDecoration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      <Image
        src="/images/decor/flat-3.png"
        alt=""
        width={191}
        height={78}
        className="absolute right-[-60px] top-[40px] rotate-[-151.25deg] opacity-5"
      />
    </div>
  );
}

/** Reacción de la imagen de un banner secundario al pasar o enfocar (entrega de diseño, `.cat`). */
const IMAGE_HOVER = {
  // Botellas: se inclinan desde la base (spring corta, microfeedback).
  tilt: cn(
    "origin-[30%_100%] motion-safe:transition-[translate,rotate] motion-safe:duration-(--duration-focal) motion-safe:ease-spring",
    "motion-safe:group-hover/banner:-translate-y-1 motion-safe:group-hover/banner:-rotate-4",
    "motion-safe:group-focus-within/banner:-translate-y-1 motion-safe:group-focus-within/banner:-rotate-4",
    "motion-safe:group-focus-visible/banner:-translate-y-1 motion-safe:group-focus-visible/banner:-rotate-4",
  ),
  // Caja: crece un poco y gira 1,5°.
  zoom: cn(
    "motion-safe:transition-[scale,rotate] motion-safe:duration-(--duration-focal) motion-safe:ease-out",
    "motion-safe:group-hover/banner:scale-106 motion-safe:group-hover/banner:rotate-[1.5deg]",
    "motion-safe:group-focus-within/banner:scale-106 motion-safe:group-focus-within/banner:rotate-[1.5deg]",
    "motion-safe:group-focus-visible/banner:scale-106 motion-safe:group-focus-visible/banner:rotate-[1.5deg]",
  ),
} as const;

/**
 * Foto a sangre (`imageFit="bleed"`): girar o subir dejaría ver el borde por el lado a sangre. Se escala
 * desde el centro lo justo para cubrir el giro (6 % cubre 2° en una caja de 216 × 188).
 */
const IMAGE_HOVER_BLEED = {
  tilt: cn(
    "motion-safe:transition-[scale,rotate] motion-safe:duration-(--duration-focal) motion-safe:ease-out",
    "motion-safe:group-hover/banner:scale-106 motion-safe:group-hover/banner:-rotate-2",
    "motion-safe:group-focus-within/banner:scale-106 motion-safe:group-focus-within/banner:-rotate-2",
    "motion-safe:group-focus-visible/banner:scale-106 motion-safe:group-focus-visible/banner:-rotate-2",
  ),
  zoom: IMAGE_HOVER.zoom,
} as const;

export function MlPromoBanner({
  variant = "main",
  title,
  subtitle,
  imageSrc,
  imageAlt,
  imagePosition,
  headingLevel = 2,
  ctaLabel,
  onCtaPress,
  ctaHref,
  animateEntrance = false,
  imageHover,
  imageFit = "contain",
  href,
  linkLabel,
  className,
}: MlPromoBannerProps) {
  const isMain = variant === "main";
  const imageAtStart = (imagePosition ?? (isMain ? "end" : "start")) === "start";
  const isBleed = !isMain && imageFit === "bleed";
  const imageHoverClass = imageHover && (isBleed ? IMAGE_HOVER_BLEED : IMAGE_HOVER)[imageHover];
  const Heading = `h${headingLevel}` as const;
  const sectionRef = useRef<HTMLElement>(null);
  // Solo el banner principal tiene decoración que deriva: el secundario no observa nada.
  const isDrifting = useLoopActive(sectionRef);

  // Entrada escalonada al cambiar de diapositiva: título 0 ms, subtítulo 80 ms, CTA 160 ms.
  const enter = (delayClass?: string) => (animateEntrance ? cn("ofi-slide-up", delayClass) : undefined);
  const ctaClassName = cn("w-[184px] max-w-full", enter("[animation-delay:160ms]"));

  const cta = ctaLabel
    ? ctaHref ? (
      <AtButton as={Link} href={ctaHref} size="sm" className={ctaClassName}>
        {ctaLabel}
      </AtButton>
    ) : (
      <AtButton size="sm" className={ctaClassName} onPress={onCtaPress}>
        {ctaLabel}
      </AtButton>
    )
    : null;

  // Secundario con `href`: la card entera es un enlace y muestra "Explorar" al pasar o enfocar.
  const isLink = !isMain && Boolean(href);
  const rootClassName = cn(
        "group/banner relative isolate flex w-full items-stretch overflow-hidden rounded-card bg-surface-sand",
        isMain ? "min-h-[307px]" : "min-h-[188px]",
        imageAtStart && "flex-row-reverse",
        // Secundario (categoría): sube 4 px con sombra pasajera. Con movimiento reducido, solo la sombra.
        !isMain &&
          cn(
            "transition-[translate,box-shadow] duration-(--duration-base) ease-out",
            "hover:shadow-lift-card focus-within:shadow-lift-card",
            "motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1",
          ),
        isLink &&
          cn(
            "focus-visible:shadow-lift-card motion-safe:focus-visible:-translate-y-1",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          ),
        className,
      );

  const content = (
    <>
      {isMain ? <MainDecoration isDrifting={isDrifting} /> : <SecondaryDecoration />}

      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col justify-center",
          isMain ? "gap-[17px] px-6 py-10 md:px-[57px] md:py-[52px]" : "gap-2 p-6 sm:px-8",
        )}
      >
        <Heading
          className={cn(
            "font-display font-black text-brand",
            isMain
              ? "max-w-[331px] text-[41px] leading-[44px] tracking-[-0.04em] md:text-[53px] md:leading-[55px]"
              : "text-[28px] leading-tight sm:text-[35px]",
            enter(),
          )}
        >
          {title}
        </Heading>
        {subtitle && (
          <p
            className={cn(
              "text-sm font-semibold text-foreground",
              isMain ? "leading-6" : "max-w-[180px] leading-[19px]",
              enter("[animation-delay:80ms]"),
            )}
          >
            {subtitle}
          </p>
        )}
        {isLink ? (
          // El nombre lo da el aria-label del enlace: el texto visible es decorativo.
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0",
              "transition-[opacity,translate] duration-(--duration-base) ease-out motion-safe:translate-y-1.5",
              "group-hover/banner:translate-y-0 group-hover/banner:opacity-100",
              "group-focus-visible/banner:translate-y-0 group-focus-visible/banner:opacity-100",
            )}
          >
            {ctaLabel ?? "Explorar"}
            <ArrowRight
              className={cn(
                "size-3.5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
                "motion-safe:group-hover/banner:translate-x-[3px] motion-safe:group-focus-visible/banner:translate-x-[3px]",
              )}
            />
          </span>
        ) : (
          cta
        )}
      </div>

      <div
        className={cn(
          "relative z-10 shrink-0",
          // Sin diseño móvil en Figma: por debajo de sm el banner principal oculta la foto.
          isMain ? "hidden w-[47%] max-w-[463px] sm:block" : "w-[40%] max-w-[216px] sm:w-[45%]",
          // La foto se eleva y gira 1° al pasar sobre el banner principal.
          isMain &&
            cn(
              "motion-safe:transition-[translate,rotate] motion-safe:duration-(--duration-focal) motion-safe:ease-out",
              "motion-safe:group-hover/banner:-translate-y-1.5 motion-safe:group-hover/banner:-rotate-1",
            ),
          !isMain && imageHoverClass,
        )}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes={isMain ? "463px" : "216px"}
          className={cn(
            isMain && "object-cover object-left",
            !isMain && "object-contain",
            // A sangre: pegada a su lado y abajo (el banner recorta con su radio).
            isBleed && (imageAtStart ? "object-left-bottom" : "object-right-bottom"),
            animateEntrance && "ofi-photo-in",
          )}
        />
      </div>
    </>
  );

  if (isLink && href) {
    return (
      <Link href={href} aria-label={linkLabel ?? `Ver ${title.toLowerCase()}`} className={rootClassName}>
        {content}
      </Link>
    );
  }

  return (
    <section ref={isMain ? sectionRef : undefined} className={rootClassName}>
      {content}
    </section>
  );
}
