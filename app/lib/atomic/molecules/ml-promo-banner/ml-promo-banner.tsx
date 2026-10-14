"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@heroui/react";

import { AtButton } from "@/app/lib/atomic/atoms";

import { MlPromoBannerProps } from "./ml-promo-banner.types";

/** Ilustraciones vegetales al 3-5 % de opacidad (decoración del Figma, nodo 3216:28251). */
function MainDecoration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden select-none sm:block">
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
      {/* Forma verde detrás de la imagen, recortada al tercio derecho del banner. */}
      <div className="absolute inset-y-0 right-0 w-[326px] overflow-hidden">
        <Image
          src="/images/decor/banner-blob.svg"
          alt=""
          width={622}
          height={622}
          className="absolute left-[-72px] top-[-164px] max-w-none -rotate-[14.56deg]"
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
  className,
}: MlPromoBannerProps) {
  const isMain = variant === "main";
  const imageAtStart = (imagePosition ?? (isMain ? "end" : "start")) === "start";
  const Heading = `h${headingLevel}` as const;

  const cta = ctaLabel
    ? ctaHref ? (
      <AtButton as={Link} href={ctaHref} size="sm" className="w-[184px] max-w-full">
        {ctaLabel}
      </AtButton>
    ) : (
      <AtButton size="sm" className="w-[184px] max-w-full" onPress={onCtaPress}>
        {ctaLabel}
      </AtButton>
    )
    : null;

  return (
    <section
      className={cn(
        "relative isolate flex w-full items-stretch overflow-hidden rounded-card bg-surface-sand",
        isMain ? "min-h-[307px]" : "min-h-[188px]",
        imageAtStart && "flex-row-reverse",
        className,
      )}
    >
      {isMain ? <MainDecoration /> : <SecondaryDecoration />}

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
          )}
        >
          {title}
        </Heading>
        {subtitle && (
          <p
            className={cn(
              "text-sm font-semibold text-foreground",
              isMain ? "leading-6" : "max-w-[180px] leading-[19px]",
            )}
          >
            {subtitle}
          </p>
        )}
        {cta}
      </div>

      <div
        className={cn(
          "relative z-10 shrink-0",
          // Sin diseño móvil en Figma: por debajo de sm el banner principal oculta la foto.
          isMain ? "hidden w-[47%] max-w-[463px] sm:block" : "w-[40%] max-w-[216px] sm:w-[45%]",
        )}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes={isMain ? "463px" : "216px"}
          className={isMain ? "object-cover object-left" : "object-contain"}
        />
      </div>
    </section>
  );
}
