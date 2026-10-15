import type { Metadata } from "next";

import { parseCategoriaOrdenar, parseRepetirOrdenar } from "../dashboard/navegacion-cliente";

import { OrdenarProvisional } from "./ordenar-provisional";

export const metadata: Metadata = {
  title: "Ordenar · Ofibites",
};

interface OrdenarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Provisional: la pantalla real llega con T-19.
/**
 * `?categoria=bebidas|desayunos` (cards del dashboard) y `?repetir=<orderId>` ("Repetir" de las últimas
 * órdenes). Un valor desconocido se ignora.
 */
export default async function OrdenarPage({ searchParams }: OrdenarPageProps) {
  const { categoria, repetir } = await searchParams;

  return (
    <OrdenarProvisional
      categoria={parseCategoriaOrdenar(categoria)}
      repetir={parseRepetirOrdenar(repetir)}
    />
  );
}
