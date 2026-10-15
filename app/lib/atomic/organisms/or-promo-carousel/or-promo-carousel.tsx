"use client";

import { AnimationEvent, CSSProperties, FocusEvent, KeyboardEvent, PointerEvent, useRef, useState } from "react";

import { cn } from "@heroui/react";
import { Pause, Play } from "lucide-react";

import { carousel } from "@/shared/motion";
import { useInViewport, usePageVisible, usePrefersReducedMotion } from "@/shared/motion/hooks";
import { AtIconButton } from "@/app/lib/atomic/atoms";
import { MlPromoBanner } from "@/app/lib/atomic/molecules";

import { OrPromoCarouselProps } from "./or-promo-carousel.types";

/** Preferencia de reproducción: `auto` rota salvo con movimiento reducido; las otras las fija el usuario. */
type PlayPreference = "auto" | "playing" | "paused";

/**
 * Banner principal del Dashboard (Figma 3216:28249 y 3216:28272) con autoplay, como la entrega de diseño.
 *
 * - Cada `autoplayInterval` (6 s) pasa a la siguiente diapositiva, en bucle. El temporizador ES la
 *   animación de la barra del punto activo (`ofi-dot-fill`, `scale` de 0 a 1): al pausar se congela
 *   (`animation-play-state`) y al reanudar continúa donde iba; al terminar, avanza.
 * - Pausa con el cursor encima, con foco de teclado dentro, con la pestaña oculta, fuera de pantalla y con
 *   el botón de pausa (WCAG 2.2.2). Con movimiento reducido arranca en pausa.
 * - Cambio de diapositiva: la saliente se funde por encima (sin parpadeo del fondo) y la entrante sube
 *   escalonada con la foto deslizando (`animateEntrance` de `MlPromoBanner`).
 * - Cada punto tiene un área de 24 px de alto (WCAG 2.5.8) y se recorren con las flechas.
 */
export function OrPromoCarousel({
  slides,
  label = "Promociones",
  headingLevel = 2,
  autoplayInterval = carousel.interval,
  className,
}: OrPromoCarouselProps) {
  const [current, setCurrent] = useState(0);
  // La primera diapositiva llega con la página; las siguientes entran con su propia animación.
  const [hasNavigated, setHasNavigated] = useState(false);
  // Diapositiva que sale: se pinta encima mientras se funde. `turn` distingue dos salidas seguidas.
  const [leaving, setLeaving] = useState<{ index: number; turn: number } | null>(null);
  const [preference, setPreference] = useState<PlayPreference>("auto");
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isInView = useInViewport(regionRef);
  const isPageVisible = usePageVisible();
  const prefersReducedMotion = usePrefersReducedMotion();

  const count = slides.length;
  const index = Math.min(current, Math.max(count - 1, 0));
  const slide = slides[index];
  const canRotate = count > 1;
  // Modo autoplay (lo que decide el usuario o la preferencia del sistema).
  const isAutoplay =
    canRotate && (preference === "playing" || (preference === "auto" && !prefersReducedMotion));
  // Rotando ahora mismo: además, nadie la está mirando de cerca y se ve.
  const isRotating = isAutoplay && !isHovered && !hasKeyboardFocus && isInView && isPageVisible;

  if (!slide) return null;

  const goTo = (target: number) => {
    const next = ((target % count) + count) % count;
    if (next === index) return;
    setLeaving((previous) => ({ index, turn: (previous?.turn ?? 0) + 1 }));
    setHasNavigated(true);
    setCurrent(next);
  };

  const handleFillEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target === event.currentTarget) goTo(index + 1);
  };

  const handleLeavingEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setLeaving(null);
  };

  // Solo el foco de teclado pausa: un clic deja el foco en el botón y no debe parar el carrusel.
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(":focus-visible")) setHasKeyboardFocus(true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHasKeyboardFocus(false);
  };

  // El tacto no tiene "salir": solo el ratón pausa al pasar.
  const handlePointer = (isEntering: boolean) => (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setIsHovered(isEntering);
  };

  const handleDotsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const target = (index + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
    goTo(target);
    dotRefs.current[target]?.focus();
  };

  const { id, ...bannerProps } = slide;
  const leavingSlide = leaving ? slides[leaving.index] : undefined;
  const leavingProps = leavingSlide ? (({ id: _id, ...rest }) => rest)(leavingSlide) : null;
  const fillStyle = {
    "--carousel-interval": `${autoplayInterval}s`,
    animationPlayState: isRotating ? "running" : "paused",
  } as CSSProperties;

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      onPointerEnter={handlePointer(true)}
      onPointerLeave={handlePointer(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn("relative isolate", className)}
    >
      {/* Mientras rota, los cambios no se anuncian (serían interrupciones cada 6 s). */}
      <div
        aria-live={isRotating ? "off" : "polite"}
        role="group"
        aria-roledescription="diapositiva"
        aria-label={`${index + 1} de ${count}`}
      >
        <MlPromoBanner
          key={id}
          variant="main"
          headingLevel={headingLevel}
          animateEntrance={hasNavigated}
          {...bannerProps}
        />
      </div>

      {leavingSlide && leavingProps && leaving && (
        <div
          key={`${leavingSlide.id}-${leaving.turn}`}
          aria-hidden="true"
          inert
          onAnimationEnd={handleLeavingEnd}
          className="ofi-slide-leave pointer-events-none absolute inset-0 z-10"
        >
          <MlPromoBanner
            variant="main"
            headingLevel={headingLevel}
            {...leavingProps}
            className="h-full"
          />
        </div>
      )}

      {canRotate && (
        <>
          {/* Flechas izquierda/derecha: mueven el foco y la diapositiva entre los puntos. */}
          <div
            onKeyDown={handleDotsKeyDown}
            className="absolute bottom-[9px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1"
          >
            {slides.map((item, itemIndex) => {
              const isActive = itemIndex === index;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    dotRefs.current[itemIndex] = node;
                  }}
                  type="button"
                  aria-label={`Promoción ${itemIndex + 1} de ${count}: ${item.title}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(itemIndex)}
                  className={cn(
                    "group flex h-6 items-center rounded-full px-[3px]",
                    "outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus",
                  )}
                >
                  {/* El ancho del punto cambia (23 → 38 px) y empuja a los vecinos: se queda en `width`. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative block h-1.5 overflow-hidden rounded-full",
                      "motion-safe:transition-[width,background-color] motion-safe:duration-300 motion-safe:ease-out",
                      isActive
                        ? cn("w-[38px]", isAutoplay ? "bg-primary/35" : "bg-primary")
                        : "w-[23px] bg-dot-idle group-hover:bg-brand",
                    )}
                  >
                    {isActive && isAutoplay && (
                      <span
                        // `key` = diapositiva: la barra (y el temporizador) vuelve a empezar en cada cambio.
                        key={`fill-${index}`}
                        onAnimationEnd={handleFillEnd}
                        style={fillStyle}
                        className="ofi-dot-fill absolute inset-0 rounded-full bg-primary"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-2 right-3 z-20">
            <AtIconButton
              aria-label={isAutoplay ? "Pausar carrusel" : "Reanudar carrusel"}
              onPress={() => setPreference(isAutoplay ? "paused" : "playing")}
              className="size-8 min-w-8 [&_svg]:size-4"
            >
              {isAutoplay ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </AtIconButton>
          </div>
        </>
      )}
    </div>
  );
}
