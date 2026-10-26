"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useTourStore } from "@/domain/stores";
import { OrGuidedTour } from "@/ui/atomic";

import { OBJETIVOS_TOUR, PASOS_TOUR_BIENVENIDA, TOUR_BIENVENIDA } from "../../_data/tour-bienvenida";

interface TourBienvenidaProps {
  /** La URL trae `?tour=1`. */
  abrirDesdeUrl: boolean;
  /**
   * El dashboard puede mostrarse (no está en el error sin datos). Mientras sea `false` no se abre y `?tour=1`
   * se conserva: si un reintento carga los datos, se abre entonces.
   */
  puedeIniciar: boolean;
  /** La carga terminó sin recomendaciones: la sección no se pinta y su paso sobra. */
  sinRecomendaciones: boolean;
}

/**
 * Tour de bienvenida del cliente sobre el dashboard (T-33). El estado vive en `useTourStore`: cualquiera lo
 * abre con `iniciar("bienvenida-cliente")`.
 *
 * Hoy solo lo abre `?tour=1` (para probarlo y relanzarlo). Al abrirlo, el parámetro se quita de la URL
 * (`replace`, sin entrada nueva en el historial): recargar no lo vuelve a abrir sin querer; para repetirlo,
 * otra vez `?tour=1`.
 */
export function TourBienvenida({
  abrirDesdeUrl,
  puedeIniciar,
  sinRecomendaciones,
}: TourBienvenidaProps) {
  const router = useRouter();
  const isOpen = useTourStore((state) => state.activeTour === TOUR_BIENVENIDA);
  const iniciar = useTourStore((state) => state.iniciar);
  const cerrar = useTourStore((state) => state.cerrar);

  // Solo los pasos cuyo objetivo se va a pintar: "Paso N de M" cuenta los que quedan.
  const pasos = useMemo(
    () =>
      sinRecomendaciones
        ? PASOS_TOUR_BIENVENIDA.filter((paso) => paso.target !== OBJETIVOS_TOUR.recomendados)
        : PASOS_TOUR_BIENVENIDA,
    [sinRecomendaciones],
  );

  // TODO: disparar con flag de primer login (backend): cuando `GET /auth/me` (o el login) diga que el usuario
  // aún no ha visto el tour, llamar a `iniciar(TOUR_BIENVENIDA)` y, al cerrar, marcarlo como visto en el back.
  useEffect(() => {
    if (!abrirDesdeUrl || !puedeIniciar) return;
    iniciar(TOUR_BIENVENIDA);
    const url = new URL(window.location.href);
    url.searchParams.delete("tour");
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }, [abrirDesdeUrl, puedeIniciar, iniciar, router]);

  // Si se sale del dashboard con este tour abierto, no queda abierto para la próxima visita (otro tour, sí).
  useEffect(
    () => () => {
      if (useTourStore.getState().activeTour === TOUR_BIENVENIDA) cerrar();
    },
    [cerrar],
  );

  return (
    <OrGuidedTour
      steps={pasos}
      isOpen={isOpen}
      onClose={() => cerrar()}
      finishLabel="Ir al dashboard"
      returnFocusFallback="#app-main"
    />
  );
}
