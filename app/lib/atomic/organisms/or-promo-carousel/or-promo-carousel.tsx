"use client";

import { useState } from "react";

import { cn } from "@heroui/react";

import { MlPromoBanner } from "@/app/lib/atomic/molecules";

import { OrPromoCarouselProps } from "./or-promo-carousel.types";

/**
 * Banner principal del Dashboard con indicador de puntos navegable (Figma 3216:28249 y 3216:28272).
 * Versión simple: sin autoplay ni deslizamiento. El `Carrusel` completo (3151:2403) es T-05.
 * Cada punto tiene un área de 24 px de alto (WCAG 2.5.8) aunque la barra visible mida 6.
 */
export function OrPromoCarousel({
  slides,
  label = "Promociones",
  headingLevel = 2,
  className,
}: OrPromoCarouselProps) {
  const [current, setCurrent] = useState(0);
  const index = Math.min(current, Math.max(slides.length - 1, 0));
  const slide = slides[index];

  if (!slide) return null;

  const { id, ...bannerProps } = slide;

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      className={cn("relative", className)}
    >
      <div
        aria-live="polite"
        role="group"
        aria-roledescription="diapositiva"
        aria-label={`${index + 1} de ${slides.length}`}
      >
        <MlPromoBanner key={id} variant="main" headingLevel={headingLevel} {...bannerProps} />
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-[9px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1">
          {slides.map((item, itemIndex) => {
            const isActive = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Promoción ${itemIndex + 1} de ${slides.length}: ${item.title}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setCurrent(itemIndex)}
                className={cn(
                  "group flex h-6 items-center rounded-full px-[3px]",
                  "outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-1.5 rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-300",
                    isActive ? "w-[38px] bg-primary" : "w-[23px] bg-dot-idle group-hover:bg-brand",
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
