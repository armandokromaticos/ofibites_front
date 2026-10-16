"use client";

import { KeyboardEvent, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

import { duration, ease } from "@/shared/motion";

import { MlProductGalleryProps } from "./ml-product-gallery.types";

const PREV_KEYS = new Set(["ArrowUp", "ArrowLeft"]);
const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight"]);

/**
 * Galería de la ficha (Figma 3097:28706): miniaturas (92 × 102, radio 6) y foto grande (radio 22). En `lg` las
 * miniaturas van en columna a la izquierda y se desplazan dentro del alto de la foto; por debajo, en una fila
 * deslizable bajo la foto. Cada miniatura es un botón con `aria-pressed`; las flechas pasan a la anterior o la
 * siguiente (y la eligen), Inicio y Fin a los extremos. La foto nueva entra con un fundido (200 ms).
 */
export function MlProductGallery({
  images,
  productName,
  fallbackSrc,
  preload = false,
  className,
}: MlProductGalleryProps) {
  const fotos = images.length > 0 ? images : [fallbackSrc];
  const [selected, setSelected] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const actual = Math.min(selected, fotos.length - 1);
  const total = fotos.length;
  const alt = (i: number) => (total > 1 ? `${productName}, foto ${i + 1} de ${total}` : productName);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (PREV_KEYS.has(event.key)) next = Math.max(0, actual - 1);
    else if (NEXT_KEYS.has(event.key)) next = Math.min(total - 1, actual + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    thumbsRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        total > 1 &&
          "lg:grid lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[92px_minmax(0,1fr)] xl:gap-[19px]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-sand sm:aspect-[16/11] lg:order-2 lg:aspect-[474/544]">
        <AnimatePresence initial={false}>
          <motion.div
            key={fotos[actual]}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            // La nueva entra encima; la anterior se queda debajo hasta que la tapa (sin "parpadeo" del fondo).
            animate={{ opacity: 1, zIndex: 1, transition: { duration: duration.fast, ease: ease.out } }}
            exit={{
              opacity: 0,
              zIndex: 0,
              transition: { duration: duration.instant, delay: duration.fast },
            }}
          >
            <Image
              src={fotos[actual]}
              alt={alt(actual)}
              fill
              preload={preload && actual === 0}
              loading={preload && actual === 0 ? "eager" : undefined}
              sizes="(min-width: 1280px) 474px, (min-width: 1024px) 34vw, 92vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 && (
        // En lg el alto lo pone la foto: la columna de miniaturas se desplaza dentro de ese alto.
        <div className="relative lg:order-1">
          <div
            ref={thumbsRef}
            role="group"
            aria-label={`Fotos de ${productName}`}
            onKeyDown={handleKeyDown}
            // Sin barra de scroll: en Windows ocupa ~15 px de la columna y recorta las miniaturas. Se sigue
            // desplazando con rueda, táctil y flechas (la elegida se trae a la vista).
            className={cn(
              "flex gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "lg:absolute lg:inset-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden",
            )}
          >
            {fotos.map((src, i) => {
              const isActive = i === actual;
              return (
                <button
                  key={src}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`Ver foto ${i + 1} de ${total}`}
                  // Una sola parada de Tab: la miniatura elegida; las flechas recorren el resto.
                  tabIndex={isActive ? 0 : -1}
                  onClick={(event) => {
                    setSelected(i);
                    event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
                  }}
                  className={cn(
                    // En lg el ancho lo da la columna del grid (72 / 92 px); un ancho fijo la desbordaba con el padding.
                    "relative aspect-[92/102] w-[72px] shrink-0 overflow-hidden rounded-[6px] bg-content1 lg:w-full",
                    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                    "transition-[opacity,box-shadow] duration-(--duration-instant) ease-out",
                    isActive ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="92px" className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
