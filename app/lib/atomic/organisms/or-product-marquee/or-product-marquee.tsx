"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";

import { cn } from "@heroui/react";

import { OrProductMarqueeItem, OrProductMarqueeProps } from "./or-product-marquee.types";

const COLUMNS = 3;
const ROWS = 3;

/** Sentido y segundos por ciclo de cada columna: alternos y distintos para que nunca se alineen. */
const COLUMN_MOTION = [
  { className: "ofi-marquee-up", seconds: 52 },
  { className: "ofi-marquee-down", seconds: 46 },
  { className: "ofi-marquee-up", seconds: 58 },
] as const;
const STRIP_SECONDS = 64;

interface Slot {
  id: string;
  front: OrProductMarqueeItem;
  /** Sin cara trasera, la tarjeta no gira. */
  back?: OrProductMarqueeItem;
  /** Caja de imagen alta (4:5) o cuadrada: alterna para que las columnas no formen filas. */
  isTall: boolean;
}

const FRONT_COUNT = COLUMNS * ROWS;

/**
 * Reparto sin repeticiones a la vista: los 9 primeros surtidos son las caras delanteras (columna a
 * columna) y ninguno se repite dentro de una columna ni en la vecina. Al girar, la columna izquierda
 * enseña los de la derecha y viceversa (no son vecinas); la central solo gira hacia los surtidos que
 * sobran tras los 9 (uno por tarjeta), que no salen en ninguna otra.
 */
function buildColumns(items: OrProductMarqueeItem[]): Slot[][] {
  const fronts = Array.from({ length: FRONT_COUNT }, (_, index) => items[index % items.length]);
  const extras = items.slice(FRONT_COUNT);
  const at = (column: number, row: number) => fronts[column * ROWS + row];
  return Array.from({ length: COLUMNS }, (_, column) =>
    Array.from({ length: ROWS }, (_, row) => {
      const back =
        column === 1
          ? extras[row]
          : items.length >= FRONT_COUNT
            ? at(COLUMNS - 1 - column, row)
            : undefined;
      const front = at(column, row);
      // Las cajas (plate) son apaisadas: en un marco 4:5 dejarían bandas vacías arriba y abajo.
      const hasPlate = front.kind === "plate" || back?.kind === "plate";
      return {
        id: `${column}-${row}`,
        front,
        back,
        isTall: !hasPlate && (column + row) % 2 === 0,
      };
    }),
  );
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Preferencia de movimiento reducido. Con `useSyncExternalStore` la hidratación usa el valor del
 * servidor (`false`) y luego corrige: leerla en el primer render (como `useReducedMotion` de
 * framer-motion) descuadra los atributos del HTML del servidor.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** La pestaña está a la vista (en el servidor, sí). */
function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

interface FaceProps {
  item: OrProductMarqueeItem;
  isTall: boolean;
  compact: boolean;
  sizes: string;
  /**
   * Cara trasera: ocupa el alto que marca la delantera, así que la imagen cede lo que el texto
   * necesite (un nombre de dos líneas no desborda la tarjeta).
   */
  isBack?: boolean;
}

const IMAGE_CLASS: Record<OrProductMarqueeItem["kind"], string> = {
  // Recorte sobre transparente: casi a sangre, con la sombra de producto (la única elevación del mosaico).
  cutout: "object-contain p-1 drop-shadow-product",
  // Foto con fondo propio: llena la caja con radio 12.
  photo: "object-cover",
  // Fondo ya igualado a surface-sand: se funde con la tarjeta, sin sombra ni radio.
  plate: "object-contain",
};

function Face({ item, isTall, compact, sizes, isBack = false }: FaceProps) {
  const isPhoto = item.kind === "photo";
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-card bg-surface-sand",
        compact ? "gap-2 p-2" : "gap-3 p-3",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isBack ? "min-h-0 flex-1" : isTall ? "aspect-[4/5]" : "aspect-square",
          isPhoto && "rounded-control",
        )}
      >
        <Image
          src={item.imageSrc}
          alt=""
          fill
          sizes={sizes}
          fetchPriority="low"
          className={IMAGE_CLASS[item.kind]}
        />
      </div>
      <div className={cn("flex flex-col gap-0.5", compact ? "px-1 pb-0.5" : "px-1.5 pb-1")}>
        <span
          className={cn(
            "line-clamp-2 font-bold text-foreground",
            compact ? "text-[13px] leading-4" : "text-[15px] leading-5",
          )}
        >
          {item.name}
        </span>
        {item.category && (
          <span
            className={cn(
              "font-semibold text-brand",
              compact ? "text-[11px] leading-4" : "text-[13px] leading-4",
            )}
          >
            {item.category}
          </span>
        )}
      </div>
    </div>
  );
}

interface FlipCardProps {
  slot: Slot;
  isFlipped: boolean;
  compact?: boolean;
  sizes: string;
  className?: string;
}

/** Dos caras en 3D: la delantera marca el tamaño y la trasera se superpone girada 180°. */
function FlipCard({ slot, isFlipped, compact = false, sizes, className }: FlipCardProps) {
  return (
    <div className={cn("perspective-[1200px]", className)}>
      <div
        className={cn(
          "relative transform-3d transition-transform duration-(--duration-focal) ease-in-out motion-reduce:transition-none",
          isFlipped && "rotate-y-180",
        )}
      >
        <div className="backface-hidden">
          <Face item={slot.front} isTall={slot.isTall} compact={compact} sizes={sizes} />
        </div>
        {slot.back && (
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <Face item={slot.back} isTall={slot.isTall} compact={compact} sizes={sizes} isBack />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mosaico vivo de surtidos (decoración del login v2). Desde `lg`, tres columnas que se desplazan en
 * vertical en sentidos alternos; por debajo, una franja horizontal. Cada `flipInterval` una tarjeta
 * gira y enseña otro surtido. Todo es `aria-hidden`: el contenido de la página es el formulario.
 *
 * Se detiene con `paused`, con la pestaña oculta y fuera de pantalla. Con `prefers-reduced-motion`
 * queda estático: sin desplazamiento (CSS) ni giros. Las pistas llevan la lista dos veces y se
 * desplazan un 50 %: el bucle no salta.
 */
export function OrProductMarquee({
  items,
  paused = false,
  flipInterval = 3200,
  className,
}: OrProductMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const isPageVisible = usePageVisible();
  const prefersReducedMotion = usePrefersReducedMotion();
  const columns = useMemo(() => (items.length > 0 ? buildColumns(items) : []), [items]);
  // Solo giran las tarjetas con cara trasera.
  const slotIds = useMemo(
    () =>
      columns
        .flat()
        .filter((slot) => slot.back)
        .map((slot) => slot.id),
    [columns],
  );
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(() => new Set());
  const lastFlippedRef = useRef<string | null>(null);

  const isRunning = !paused && isInView && isPageVisible && !prefersReducedMotion;

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isRunning || slotIds.length < 2) return;
    const timer = window.setInterval(() => {
      const candidates = slotIds.filter((id) => id !== lastFlippedRef.current);
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      lastFlippedRef.current = next;
      setFlipped((previous) => {
        const updated = new Set(previous);
        if (updated.has(next)) updated.delete(next);
        else updated.add(next);
        return updated;
      });
    }, flipInterval);
    return () => window.clearInterval(timer);
  }, [isRunning, flipInterval, slotIds]);

  if (columns.length === 0) return null;

  const trackState = (seconds: number): CSSProperties => ({
    animationDuration: `${seconds}s`,
    animationPlayState: isRunning ? "running" : "paused",
  });
  const isShowingBack = (id: string) => !prefersReducedMotion && flipped.has(id);
  const allSlots = columns.flat();

  return (
    <div ref={rootRef} aria-hidden="true" className={cn("pointer-events-none select-none", className)}>
      {/* Escritorio: tres columnas verticales con los bordes superior e inferior desvanecidos. */}
      <div className="hidden h-full grid-cols-3 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_7%,black_93%,transparent)] lg:grid">
        {columns.map((slots, column) => {
          const motion = COLUMN_MOTION[column];
          return (
            <div key={column} className="min-w-0">
              <div
                className={cn("flex flex-col", motion.className, isRunning && "will-change-transform")}
                style={trackState(motion.seconds)}
              >
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex flex-col gap-4 pb-4">
                    {slots.map((slot) => (
                      <FlipCard
                        key={slot.id}
                        slot={slot}
                        isFlipped={isShowingBack(slot.id)}
                        sizes="(min-width: 1440px) 240px, 17vw"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Móvil y tablet: una fila que se desplaza en horizontal, con los laterales desvanecidos. */}
      <div className="overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] lg:hidden">
        <div
          className={cn("flex w-max", "ofi-marquee-left", isRunning && "will-change-transform")}
          style={trackState(STRIP_SECONDS)}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-3 pr-3">
              {allSlots.map((slot) => (
                <FlipCard
                  key={slot.id}
                  slot={{ ...slot, isTall: false }}
                  isFlipped={isShowingBack(slot.id)}
                  compact
                  sizes="132px"
                  className="w-[132px] shrink-0"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
