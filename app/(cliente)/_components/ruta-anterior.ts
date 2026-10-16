// Rutas anteriores dentro de la app del cliente, para los "‹ Volver" que deben llevar a la página de la que se
// vino (con su query: Ordenar guarda los filtros en la URL) sin depender del historial del navegador, que puede
// salir de la app (pestaña nueva → ficha A → ficha B → Volver → Volver). Es una pila de URL (`pathname + search`):
// navegar a otra página apila la actual; volver ("‹ Volver", que llama a `marcarVueltaCliente`, o atrás/adelante del
// navegador) a la URL de la cima la desapila. Solo al volver: llegar a la misma URL con un enlace normal apila. La
// alimenta `AppCliente`, montado una vez para todo el grupo `(cliente)`, y se vacía al desmontarlo (cerrar sesión).

const MAX_PILA = 50;

let pila: string[] = [];
let actual: string | null = null;
let volviendo = false;

const urlActual = () => `${window.location.pathname}${window.location.search}`;

/** Registra la página a la que se acaba de llegar (llamar en cada cambio de `pathname`). */
export function registrarRutaCliente(): void {
  const nueva = urlActual();
  if (nueva === actual) return;
  if (volviendo && pila.at(-1) === nueva) pila.pop();
  else if (actual) pila = [...pila, actual].slice(-MAX_PILA);
  actual = nueva;
  volviendo = false;
}

/** La próxima navegación es una vuelta atrás ("‹ Volver" o `popstate`): si llega a la cima de la pila, la desapila. */
export function marcarVueltaCliente(): void {
  volviendo = true;
}

/**
 * Refresca la URL de la página actual justo antes de salir de ella (clic en un enlace): recoge los cambios de query
 * hechos sin navegar (`history.replaceState` de los filtros de Ordenar).
 */
export function refrescarRutaActualCliente(): void {
  if (actual !== null) actual = urlActual();
}

/** URL de la página anterior dentro de la app, o `null` si se entró directamente en esta. */
export function rutaAnteriorCliente(): string | null {
  return pila.at(-1) ?? null;
}

export function reiniciarRutasCliente(): void {
  pila = [];
  actual = null;
  volviendo = false;
}
