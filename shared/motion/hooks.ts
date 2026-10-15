import { RefObject, useEffect, useState, useSyncExternalStore } from "react";

/*
 * Hooks de motion para componentes cliente. No se exportan desde el barrel `@/shared/motion`
 * (lo importan también componentes de servidor): impórtalos de `@/shared/motion/hooks`.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/**
 * Preferencia de movimiento reducido. Con `useSyncExternalStore` la hidratación usa el valor del
 * servidor (`false`) y luego corrige: leerla en el primer render (como `useReducedMotion` de
 * framer-motion) descuadra los atributos del HTML del servidor.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** La pestaña está a la vista (en el servidor, sí). */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

/**
 * El elemento está dentro del viewport. Empieza en `false`: nada se anima hasta medirlo.
 * Se observa el nodo montado en el primer efecto: debe seguir montado (el mismo nodo) mientras viva el
 * componente. Si el `ref` pasa a otro elemento o se monta más tarde, no se vuelve a observar.
 */
export function useInViewport(ref: RefObject<Element | null>): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}

/**
 * Un bucle decorativo (drift, bob, brillo) solo corre si el elemento se ve, la pestaña está activa y
 * el usuario no pidió movimiento reducido. Con `false`, quita la clase del bucle (no lo pauses a medias).
 */
export function useLoopActive(ref: RefObject<Element | null>): boolean {
  const isInView = useInViewport(ref);
  const isPageVisible = usePageVisible();
  const prefersReducedMotion = usePrefersReducedMotion();
  return isInView && isPageVisible && !prefersReducedMotion;
}
