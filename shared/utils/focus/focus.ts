/**
 * Lleva el foco al primer campo con `aria-invalid="true"` dentro de `raiz` (por defecto, el diálogo abierto) tras
 * pintar los errores de una validación fallida. Espera un frame: el `setState` de los errores aún no se ha
 * aplicado cuando se llama desde el handler. Se saltan los controles ocultos (`aria-hidden`), como el `<select>`
 * nativo que HeroUI pone detrás de `Select`.
 */
export function enfocarPrimerCampoInvalido(raiz: string = "[role=\"dialog\"]"): void {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    const candidatos = document.querySelectorAll<HTMLElement>(`${raiz} [aria-invalid="true"]`);
    const campo = Array.from(candidatos).find((el) => !el.closest("[aria-hidden=\"true\"]"));
    campo?.focus();
  });
}
