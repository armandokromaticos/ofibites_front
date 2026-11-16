"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { duration, ease } from "@/shared/motion";
import { AtButton } from "@/ui/atomic/atoms";

import {
  OrGuidedTourCloseReason,
  OrGuidedTourPlacement,
  OrGuidedTourProps,
  OrGuidedTourStep,
} from "./or-guided-tour.types";

/** Distancia mínima de la tarjeta a los bordes de la ventana. */
const VIEWPORT_MARGIN = 16;
/** Separación entre el foco y la tarjeta. */
const CARD_GAP = 20;
const DEFAULT_PADDING = 12;
/** Por debajo de este ancho la tarjeta va fija abajo (bottom sheet). */
const SHEET_BREAKPOINT = 640;
/** Tras cambiar de paso, el botón principal ignora pulsaciones: un doble clic no salta dos pasos ni cierra. */
const STEP_PRESS_LOCK_MS = 400;
/** El foco y la tarjeta viajan con transición solo justo después de cambiar de paso (no al hacer scroll). */
const STEP_MOVE_MS = 450;
const FALLBACK_CARD_SIZE = { width: 380, height: 210 };
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const MOVE_TRANSITION =
  "duration-(--duration-base) ease-out motion-reduce:transition-none";

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourLayout {
  /** Rectángulo del foco en la ventana; `null` = sin elemento: velo completo y tarjeta centrada. */
  spot: Box | null;
  card: { top: number; left: number };
  isSheet: boolean;
}

function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    getComputedStyle(element).visibility !== "hidden"
  );
}

/** El primer elemento visible con alguno de los `data-tour` del paso, en su orden. */
function findTarget(target: OrGuidedTourStep["target"]): HTMLElement | null {
  const ids = Array.isArray(target) ? target : [target];
  for (const id of ids) {
    const candidates = document.querySelectorAll<HTMLElement>(
      `[data-tour="${CSS.escape(id)}"]`,
    );
    for (const candidate of Array.from(candidates)) {
      if (isVisible(candidate)) return candidate;
    }
  }
  return null;
}

/** Foco = elemento + margen, recortado a la ventana (4 px dentro) para que el borde siempre se vea. */
function spotlightBox(
  rect: DOMRect,
  padding: number,
  vw: number,
  vh: number,
): Box {
  const inset = 4;
  let left = rect.left - padding;
  let top = rect.top - padding;
  let right = rect.right + padding;
  let bottom = rect.bottom + padding;
  const clipped = {
    left: Math.max(left, inset),
    top: Math.max(top, inset),
    right: Math.min(right, vw - inset),
    bottom: Math.min(bottom, vh - inset),
  };
  // Si el elemento está fuera de la ventana (en pleno scroll) se deja tal cual: el velo sigue cubriendo.
  if (clipped.right > clipped.left && clipped.bottom > clipped.top) {
    ({ left, top, right, bottom } = clipped);
  }
  return { top, left, width: right - left, height: bottom - top };
}

/**
 * Posición de la tarjeta: en el lado preferido si cabe; si no, abajo, arriba, derecha o izquierda. Si no cabe
 * en ninguno (elemento más alto que la ventana), arriba recortada a la ventana, encima del elemento.
 */
function placeCard(
  spot: Box | null,
  size: { width: number; height: number },
  vw: number,
  vh: number,
  preferred?: OrGuidedTourPlacement,
): { top: number; left: number } {
  const m = VIEWPORT_MARGIN;
  const clampX = (x: number) =>
    Math.min(Math.max(x, m), Math.max(m, vw - size.width - m));
  const clampY = (y: number) =>
    Math.min(Math.max(y, m), Math.max(m, vh - size.height - m));

  if (!spot)
    return {
      left: clampX((vw - size.width) / 2),
      top: clampY((vh - size.height) / 2),
    };

  const right = spot.left + spot.width;
  const bottom = spot.top + spot.height;
  // Alineada con el borde del elemento más cercano al centro (como en el Figma: a la derecha si está a la derecha).
  const alignedX = clampX(
    spot.left + spot.width / 2 > vw / 2 ? right - size.width : spot.left,
  );
  const room: Record<OrGuidedTourPlacement, boolean> = {
    bottom: vh - bottom - CARD_GAP - m >= size.height,
    top: spot.top - CARD_GAP - m >= size.height,
    right: vw - right - CARD_GAP - m >= size.width,
    left: spot.left - CARD_GAP - m >= size.width,
  };
  const order: OrGuidedTourPlacement[] = [
    ...(preferred ? [preferred] : []),
    "bottom",
    "top",
    "right",
    "left",
  ];
  const side = order.find((placement) => room[placement]) ?? "top";

  switch (side) {
    case "bottom":
      return { top: clampY(bottom + CARD_GAP), left: alignedX };
    case "top":
      return { top: clampY(spot.top - CARD_GAP - size.height), left: alignedX };
    case "right":
      return { top: clampY(spot.top), left: clampX(right + CARD_GAP) };
    case "left":
      return {
        top: clampY(spot.top),
        left: clampX(spot.left - CARD_GAP - size.width),
      };
  }
}

function sameBox(a: Box | null, b: Box | null): boolean {
  if (!a || !b) return a === b;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  );
}

function sameLayout(a: TourLayout, b: TourLayout): boolean {
  return (
    a.isSheet === b.isSheet &&
    a.card.top === b.card.top &&
    a.card.left === b.card.left &&
    sameBox(a.spot, b.spot)
  );
}

/**
 * Sitio que hay que dejar libre arriba o abajo del elemento para la tarjeta: abajo, el bottom sheet; en
 * escritorio, la tarjeta en su lado preferido (arriba o abajo) más la separación.
 */
function cardReserve(
  isSheet: boolean,
  cardHeight: number,
  placement?: OrGuidedTourPlacement,
): { top: number; bottom: number } {
  if (isSheet) return { top: 0, bottom: cardHeight };
  if (placement === "top") return { top: 0, bottom: 0 };
  if (placement === "bottom") return { top: 0, bottom: cardHeight + CARD_GAP };
  return { top: 0, bottom: 0 };
}

/**
 * Lleva el elemento a la vista dentro de su ancestro scrollable más cercano, dejando espacio para la tarjeta.
 * No usa `scrollIntoView` ni `scrollMargin` para evitar que el browser expanda el scroll range más allá del
 * contenido cuando el elemento está al final de un contenedor con altura fija (`overflow-y-auto`).
 */
function revealTarget(
  element: HTMLElement,
  reserve: { top: number; bottom: number },
) {
  const rect = element.getBoundingClientRect();
  const vh = window.innerHeight;
  const isVisibleWithCard =
    rect.top >= VIEWPORT_MARGIN + reserve.top &&
    rect.bottom <= vh - VIEWPORT_MARGIN - reserve.bottom;
  if (isVisibleWithCard) return;

  // Encuentra el ancestro scrollable más cercano (o window como fallback).
  let scroller: HTMLElement | null = element.parentElement;
  while (scroller) {
    const { overflowY } = getComputedStyle(scroller);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    )
      break;
    scroller = scroller.parentElement;
  }

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (!scroller) {
    // Fallback: window
    const targetY = window.scrollY + rect.top - VIEWPORT_MARGIN - reserve.top;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: reducedMotion ? "instant" : "smooth",
    });
    return;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  // Posición del elemento relativa al contenedor.
  const relTop = rect.top - scrollerRect.top + scroller.scrollTop;
  const relBottom = relTop + rect.height;
  const visibleTop = scroller.scrollTop + VIEWPORT_MARGIN + reserve.top;
  const visibleBottom =
    scroller.scrollTop +
    scroller.clientHeight -
    VIEWPORT_MARGIN -
    reserve.bottom;

  const fits =
    rect.height + reserve.top + reserve.bottom + VIEWPORT_MARGIN * 4 <=
    scroller.clientHeight;
  let targetScrollTop: number;
  if (fits) {
    // Centrar dentro del espacio disponible.
    const availableTop = VIEWPORT_MARGIN + reserve.top;
    const availableBottom = VIEWPORT_MARGIN + reserve.bottom;
    targetScrollTop =
      relTop -
      availableTop -
      (scroller.clientHeight - availableTop - availableBottom - rect.height) /
        2;
  } else {
    targetScrollTop = relTop - VIEWPORT_MARGIN - reserve.top;
  }

  // Clamp: nunca más allá del contenido real.
  const maxScroll = scroller.scrollHeight - scroller.clientHeight;
  targetScrollTop = Math.min(Math.max(0, targetScrollTop), maxScroll);

  if (relTop >= visibleTop && relBottom <= visibleBottom) return;

  scroller.scrollTo({
    top: targetScrollTop,
    behavior: reducedMotion ? "instant" : "smooth",
  });
}

/**
 * Recorrido guiado (Figma Tour 3503:4852): velo oscuro con un foco de borde `accent` sobre el elemento de cada
 * paso (atributo `data-tour`) y una tarjeta con "Paso N de M", título, texto, "Omitir recorrido" y el botón de
 * avance. Genérico: los pasos y cuándo abrirlo los decide quien lo monta.
 *
 * - Es un diálogo modal: `role="dialog"` + `aria-modal`, el resto de la página `inert` mientras está abierto,
 *   Tab atrapado en la tarjeta, foco inicial (y en cada paso) en el botón principal, Esc = omitir, y al cerrar
 *   el foco vuelve a donde estaba (o a `returnFocusFallback`). El cambio de paso se anuncia con `aria-live`.
 * - Posición: recalculada en resize, scroll (de cualquier contenedor) y cambios de tamaño o de DOM; el elemento
 *   se lleva a la vista si no se ve. Si no existe todavía, tarjeta centrada sin foco hasta que aparezca.
 * - Por debajo de 640 px la tarjeta es un bottom sheet.
 * - Movimiento: entra con fundido + 8 px y sale en 200 ms; el foco viaja entre pasos en 320 ms. Con movimiento
 *   reducido, solo fundidos y scroll instantáneo.
 */
export function OrGuidedTour({ isOpen, ...props }: OrGuidedTourProps) {
  return (
    <AnimatePresence>
      {isOpen && props.steps.length > 0 && (
        <GuidedTourLayer key="tour" {...props} />
      )}
    </AnimatePresence>
  );
}

function GuidedTourLayer({
  steps,
  onClose,
  nextLabel = "Siguiente",
  finishLabel = "Finalizar",
  skipLabel = "Omitir recorrido",
  returnFocusFallback,
}: Omit<OrGuidedTourProps, "isOpen">) {
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState<TourLayout | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const isClosed = useRef(false);
  const pressLockUntil = useRef(0);
  const moveTimer = useRef<number | undefined>(undefined);
  const onCloseRef = useRef(onClose);
  const baseId = useId();
  const stepId = `${baseId}-paso`;
  const titleId = `${baseId}-titulo`;
  const descriptionId = `${baseId}-texto`;

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;
  // Paso actual para la medida: unos `steps` en línea (identidad nueva en cada render) no rehacen la medida ni
  // el scroll; solo un cambio de paso.
  const stepRef = useRef(step);

  useEffect(() => {
    onCloseRef.current = onClose;
    stepRef.current = step;
  });

  const close = useCallback((reason: OrGuidedTourCloseReason) => {
    if (isClosed.current) return;
    isClosed.current = true;
    onCloseRef.current(reason);
  }, []);

  // Modal: todo lo que cuelga de <body> salvo el tour queda inerte. Al cerrar, se restaura y el foco vuelve.
  useEffect(() => {
    const root = rootRef.current;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const madeInert: Element[] = [];
    // Captura el scroll de todos los contenedores desplazables ANTES de que el tour haga scroll.
    const scrollSnapshot: { el: HTMLElement; top: number; left: number }[] = [];
    for (const child of Array.from(document.body.children)) {
      if (
        !root ||
        child === root ||
        child.contains(root) ||
        child.hasAttribute("inert")
      )
        continue;
      child.setAttribute("inert", "");
      madeInert.push(child);
    }
    const windowScrollY = window.scrollY;
    const windowScrollX = window.scrollX;
    document.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el === root || root?.contains(el)) return;
      if (
        el.scrollHeight > el.clientHeight ||
        el.scrollWidth > el.clientWidth
      ) {
        scrollSnapshot.push({ el, top: el.scrollTop, left: el.scrollLeft });
      }
    });
    return () => {
      madeInert.forEach((child) => child.removeAttribute("inert"));
      window.scrollTo({
        top: windowScrollY,
        left: windowScrollX,
        behavior: "instant",
      });
      scrollSnapshot.forEach(({ el, top, left }) => {
        el.scrollTop = top;
        el.scrollLeft = left;
      });
      const canReturn =
        previous && previous !== document.body && previous.isConnected;
      const fallback = returnFocusFallback
        ? document.querySelector<HTMLElement>(returnFocusFallback)
        : null;
      const target = canReturn ? previous : fallback;
      target?.focus({ preventScroll: true });
    };
  }, [returnFocusFallback]);

  useEffect(() => () => window.clearTimeout(moveTimer.current), []);

  // Foco en el botón principal al abrir y en cada paso.
  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, [index]);

  // Esc omite; Tab da la vuelta dentro de la tarjeta (también si el foco se quedó en <body>).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close("skip");
        return;
      }
      if (event.key !== "Tab") return;
      const card = cardRef.current;
      if (!card) return;
      const focusables = Array.from(
        card.querySelectorAll<HTMLElement>("button:not([disabled]), [href]"),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (!card.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [close]);

  // Medida del foco y de la tarjeta (en un frame, agrupando eventos) y scroll al elemento del paso.
  useEffect(() => {
    let frame = 0;
    let observedTarget: Element | null = null;
    let revealed = false;

    const measure = () => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const card = cardRef.current;
      const isSheet = vw < SHEET_BREAKPOINT;
      const size = card
        ? { width: card.offsetWidth, height: card.offsetHeight }
        : FALLBACK_CARD_SIZE;
      const step = stepRef.current;
      const target = findTarget(step.target);

      if (target !== observedTarget) {
        if (observedTarget) resizeObserver.unobserve(observedTarget);
        if (target) resizeObserver.observe(target);
        observedTarget = target;
      }
      if (target && !revealed) {
        revealed = true;
        revealTarget(target, cardReserve(isSheet, size.height, step.placement));
      }

      const padding = step.padding ?? DEFAULT_PADDING;
      const spot = target
        ? spotlightBox(target.getBoundingClientRect(), padding, vw, vh)
        : null;
      const next: TourLayout = {
        spot,
        card: isSheet
          ? { top: 0, left: 0 }
          : placeCard(spot, size, vw, vh, step.placement),
        isSheet,
      };
      setLayout((current) =>
        current && sameLayout(current, next) ? current : next,
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const resizeObserver = new ResizeObserver(schedule);
    if (cardRef.current) resizeObserver.observe(cardRef.current);
    // El elemento puede montarse más tarde (datos cargando): se vuelve a buscar con cada cambio del DOM ajeno.
    const mutationObserver = new MutationObserver((records) => {
      const root = rootRef.current;
      if (records.some((record) => !root?.contains(record.target))) schedule();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, { capture: true });
    };
    // `steps.length`: si quien lo monta quita un paso a mitad del recorrido, se vuelve a medir.
  }, [index, steps.length]);

  const handlePrimary = () => {
    if (performance.now() < pressLockUntil.current) return;
    if (isLast) {
      close("finish");
      return;
    }
    const next = index + 1;
    pressLockUntil.current = performance.now() + STEP_PRESS_LOCK_MS;
    setIndex(next);
    setAnnouncement(
      `Paso ${next + 1} de ${steps.length}: ${steps[next].title}. ${steps[next].description}`,
    );
    setIsMoving(true);
    window.clearTimeout(moveTimer.current);
    moveTimer.current = window.setTimeout(
      () => setIsMoving(false),
      STEP_MOVE_MS,
    );
  };

  const enter = { duration: duration.base, ease: ease.out };
  const exit = { duration: duration.fast, ease: ease.in };
  const spot = layout?.spot;
  const isSheet = layout?.isSheet ?? false;

  return createPortal(
    <div ref={rootRef} className="z-[70] fixed inset-0">
      {/* Velo y foco: decorativos. Capturan los clics, así la página de debajo no responde. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: layout ? 1 : 0, transition: enter }}
        exit={{ opacity: 0, transition: exit }}
      >
        {spot ? (
          <div
            className={cn(
              "absolute border-2 border-accent rounded-[20px]",
              isMoving &&
                cn("transition-[top,left,width,height]", MOVE_TRANSITION),
            )}
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              // Halo `accent` y, alrededor del hueco, el velo (una sombra que cubre toda la ventana).
              boxShadow:
                "var(--shadow-tour-spotlight), 0 0 0 200vmax var(--color-scrim-tour)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-scrim-tour" />
        )}
      </motion.div>

      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${stepId} ${titleId}`}
        aria-describedby={descriptionId}
        className={cn(
          "absolute flex flex-col gap-2.5 bg-surface-cream shadow-tour-card px-[22px] pt-5",
          isSheet
            ? "inset-x-0 bottom-0 rounded-t-2xl pb-[max(20px,env(safe-area-inset-bottom))]"
            : "w-[380px] max-w-[calc(100vw-32px)] rounded-2xl pb-5",
          isMoving && !isSheet && cn("transition-[top,left]", MOVE_TRANSITION),
        )}
        style={
          layout && !isSheet
            ? { top: layout.card.top, left: layout.card.left }
            : undefined
        }
        initial={{ opacity: 0, y: 8 }}
        animate={
          layout
            ? { opacity: 1, y: 0, transition: enter }
            : { opacity: 0, y: 8 }
        }
        exit={{ opacity: 0, y: 4, transition: exit }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="flex flex-col gap-2.5"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: duration.fast, ease: ease.out },
            }}
            exit={{
              opacity: 0,
              transition: { duration: duration.instant, ease: ease.in },
            }}
          >
            {/* `accent` en texto de 15 px no llega a AA: el tono oscuro (tech-rules/theming). */}
            <p
              id={stepId}
              className="font-semibold text-[15px] text-secondary-600 leading-[18px]"
            >
              Paso {index + 1} de {steps.length}
            </p>
            <h2
              id={titleId}
              className="font-semibold text-foreground text-xl leading-6"
            >
              {step.title}
            </h2>
            <p
              id={descriptionId}
              className="text-muted text-base leading-[19px]"
            >
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div
          className={cn(
            "flex items-center gap-3",
            isLast ? "justify-end" : "justify-between",
          )}
        >
          {!isLast && (
            <AtButton
              variant="light"
              color="default"
              size="sm"
              className="-ml-2 px-2 h-[39px] text-placeholder text-sm"
              onPress={() => close("skip")}
            >
              {skipLabel}
            </AtButton>
          )}
          <AtButton
            ref={primaryRef}
            className="px-5 h-[39px] text-sm"
            endContent={<ArrowRight aria-hidden="true" className="size-4" />}
            onPress={handlePrimary}
          >
            {isLast ? finishLabel : nextLabel}
          </AtButton>
        </div>

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </motion.div>
    </div>,
    document.body,
  );
}
