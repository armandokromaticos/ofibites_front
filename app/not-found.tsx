import type { Metadata } from "next";

import { PaginaNoEncontrada } from "./_components/pagina-no-encontrada";

export const metadata: Metadata = {
  title: "Página no encontrada · Ofibites",
};

/** 404 global: cualquier ruta inexistente y los `notFound()` de rutas sin `not-found.tsx` propio. */
export default function NotFound() {
  return <PaginaNoEncontrada />;
}
