import { useCallback, useEffect, useRef } from "react";

const GUARDA_MS = 400;

/**
 * El botón principal de cada paso ocupa el mismo sitio ("Continuar paso 2" → "Continuar paso 3"): el 2.º clic de
 * un doble clic avanzaría dos pasos. Devuelve `true` durante ~400 ms tras montar el paso (tech-rules/atomic).
 */
export function useGuardaDobleClic(): () => boolean {
  const montadoEn = useRef(0);
  useEffect(() => {
    montadoEn.current = Date.now();
  }, []);
  return useCallback(() => Date.now() - montadoEn.current < GUARDA_MS, []);
}
