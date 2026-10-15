import type { Transition, Variants } from "framer-motion";

import { duration, ease, stagger } from "./tokens";

const enter = (seconds: number = duration.base): Transition => ({ duration: seconds, ease: ease.out });
const exit = (seconds: number = duration.fast): Transition => ({ duration: seconds, ease: ease.in });

/**
 * Entrada de un bloque: aparece y sube 8 px. Úsalo con `initial="hidden" animate="visible" exit="exit"`.
 * Con `MotionConfig reducedMotion="user"` el desplazamiento se anula y queda el fundido.
 */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: enter() },
  exit: { opacity: 0, y: 4, transition: exit() },
};

/**
 * Modal: escala 0.96 → 1 con fundido, 320 ms de entrada y 200 ms de salida. Las claves `enter`/`exit`
 * son las que usa `Modal` de HeroUI en `motionProps.variants`.
 */
export const modal: Variants = {
  enter: { opacity: 1, scale: 1, transition: enter() },
  exit: { opacity: 0, scale: 0.96, transition: exit() },
};

/** `motionProps` listo para `Modal` de HeroUI (lo aplica `AtModal`). */
export const modalMotionProps = { variants: modal } as const;

/**
 * Lista con stagger acotado: el contenedor reparte `stagger.step` entre hijos, pero ningún hijo
 * espera más de `stagger.maxTotal` (una lista larga no hace esperar al último).
 */
export function listStagger(count: number): { container: Variants; item: Variants } {
  const step = count > 1 ? Math.min(stagger.step, stagger.maxTotal / (count - 1)) : 0;
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: step } },
    },
    item: fadeRise,
  };
}
