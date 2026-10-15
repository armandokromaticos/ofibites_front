/**
 * Tokens de motion (espejo de `@theme` en `app/globals.css`). Duraciones en segundos, como las pide
 * framer-motion. Regla: la salida dura menos que la entrada y acelera (`ease.in`); la entrada decelera
 * (`ease.out`).
 */
export const duration = {
  /** 120 ms: respuesta inmediata (pulsar, marcar, hover). */
  instant: 0.12,
  /** 200 ms: cambio de estado rutinario y salidas. */
  fast: 0.2,
  /** 320 ms: overlays, modales y transición entre páginas. */
  base: 0.32,
  /** 480 ms: cambios de layout grandes. */
  slow: 0.48,
  /** 700 ms: el único momento focal de una pantalla (p. ej. el título del login). */
  focal: 0.7,
} as const;

export type MotionDuration = keyof typeof duration;

type CubicBezier = [number, number, number, number];

export const ease = {
  /** Entradas: deceleración exponencial. */
  out: [0.16, 1, 0.3, 1] as CubicBezier,
  /** Salidas: aceleración, más cortas que la entrada. */
  in: [0.4, 0, 1, 1] as CubicBezier,
  /** Movimiento que empieza y acaba en reposo (reordenar, desplazar). */
  inOut: [0.65, 0, 0.35, 1] as CubicBezier,
};

export type MotionEase = keyof typeof ease;

/** Retraso entre hermanos de una lista y tope del retraso total (más elementos no esperan más). */
export const stagger = {
  step: 0.04,
  maxTotal: 0.24,
} as const;
