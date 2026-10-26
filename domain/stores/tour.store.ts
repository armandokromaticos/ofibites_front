import { create } from "zustand";

/** Recorridos guiados de la app. */
export type TourId = "bienvenida-cliente";

interface TourState {
  /** Recorrido abierto ahora mismo (uno a la vez). */
  activeTour: TourId | null;
  iniciar: (tour: TourId) => void;
  cerrar: () => void;
}

/**
 * Recorrido guiado abierto (T-33). Solo en memoria: no se persiste ni decide si el usuario ya lo vio (eso será
 * una flag del backend en el primer login, que solo tendrá que llamar a `iniciar`). Hoy lo abre `?tour=1` en
 * el dashboard del cliente.
 */
export const useTourStore = create<TourState>((set) => ({
  activeTour: null,
  iniciar: (tour) => set({ activeTour: tour }),
  cerrar: () => set({ activeTour: null }),
}));
