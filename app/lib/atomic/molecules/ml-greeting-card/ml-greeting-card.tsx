"use client";

import Link from "next/link";

import { cn } from "@heroui/react";

import { AtButton, AtSkeleton } from "@/app/lib/atomic/atoms";

import { MlGreetingCardProps } from "./ml-greeting-card.types";

/**
 * Card de saludo del Dashboard (Figma 3216:28308): "Hola" + nombre en Playfair `accent` + pregunta + CTA.
 * El nombre va en `accent` a 24 px negrita: texto grande, así que 4,0:1 sobre blanco cumple AA.
 */
export function MlGreetingCard({
  name,
  greeting = "Hola",
  prompt = "¿Qué quieres pedir hoy?",
  ctaLabel = "Realizar pedido",
  ctaHref,
  onCtaPress,
  isLoading = false,
  headingLevel = 2,
  className,
}: MlGreetingCardProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <section
      aria-busy={isLoading || undefined}
      className={cn("flex flex-col gap-[19px] rounded-card bg-content1 px-[22px] py-[14px]", className)}
    >
      <div className="flex flex-col">
        <Heading className="flex flex-col">
          <span className="text-[22px] font-bold leading-[26px] text-foreground">{greeting}</span>
          {isLoading ? (
            <>
              <span className="sr-only">Cargando tu nombre</span>
              <AtSkeleton className="my-1 h-6 w-40 rounded-full" />
            </>
          ) : (
            <span className="font-display text-2xl font-bold leading-8 text-accent">{name}</span>
          )}
        </Heading>
        <p className="text-[15px] font-medium leading-[26px] text-muted">{prompt}</p>
      </div>

      {ctaHref ? (
        <AtButton as={Link} href={ctaHref} size="sm" fullWidth>
          {ctaLabel}
        </AtButton>
      ) : (
        <AtButton size="sm" fullWidth onPress={onCtaPress}>
          {ctaLabel}
        </AtButton>
      )}
    </section>
  );
}
