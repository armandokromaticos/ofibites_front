/** Lado del lienzo al que se reescala la imagen para leer el alfa (basta con poca resolución). */
const LADO = 64;
/** Puntos muestreados por cada lado del borde. */
const PUNTOS_POR_LADO = 16;
/** Tramo de cada lado que se muestrea: se saltan las esquinas (las fotos con fondo tienen esquinas redondeadas transparentes). */
const TRAMO_INICIO = 0.2;
const TRAMO_FIN = 0.8;
/** Alfa (0-255) por debajo del cual un punto cuenta como transparente. */
const ALFA_TRANSPARENTE = 16;
/** Proporción de puntos transparentes a partir de la cual la imagen es un recorte. */
const UMBRAL_RECORTE = 0.75;
const TIMEOUT_MS = 5000;

const cache = new Map<string, Promise<boolean>>();

/** Coordenadas `[x, y]` del borde del lienzo entre el 20 % y el 80 % de cada lado. */
function puntosDelBorde(): [number, number][] {
  const ultimo = LADO - 1;
  const puntos: [number, number][] = [];
  for (let i = 0; i < PUNTOS_POR_LADO; i++) {
    const t = TRAMO_INICIO + ((TRAMO_FIN - TRAMO_INICIO) * i) / (PUNTOS_POR_LADO - 1);
    const p = Math.round(t * ultimo);
    puntos.push([p, 0], [p, ultimo], [0, p], [ultimo, p]);
  }
  return puntos;
}

function detectar(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = window.setTimeout(() => terminar(false), TIMEOUT_MS);
    function terminar(resultado: boolean) {
      window.clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
      resolve(resultado);
    }
    img.crossOrigin = "anonymous";
    img.onerror = () => terminar(false);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = LADO;
        canvas.height = LADO;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return terminar(false);
        ctx.drawImage(img, 0, 0, LADO, LADO);
        // Lanza SecurityError si el lienzo quedó contaminado (imagen de otro origen sin CORS).
        const { data } = ctx.getImageData(0, 0, LADO, LADO);
        const puntos = puntosDelBorde();
        const alfa = ([x, y]: [number, number]) => data[(y * LADO + x) * 4 + 3];
        const transparentes = puntos.filter((punto) => alfa(punto) < ALFA_TRANSPARENTE).length;
        terminar(transparentes / puntos.length >= UMBRAL_RECORTE);
      } catch {
        terminar(false);
      }
    };
    img.src = src;
  });
}

/**
 * `true` si la imagen es un recorte con transparencia (producto sin fondo, como Morning Bite): el borde, sin las
 * esquinas, es casi todo transparente. Error de carga, CORS o timeout → `false`. Se cachea por `src`.
 */
export function esImagenRecorte(src: string): Promise<boolean> {
  // Sin DOM (servidor) no se puede medir: no se cachea.
  if (typeof window === "undefined") return Promise.resolve(false);
  let resultado = cache.get(src);
  if (!resultado) {
    resultado = detectar(src);
    cache.set(src, resultado);
  }
  return resultado;
}
