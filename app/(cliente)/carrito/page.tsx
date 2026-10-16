import type { Metadata } from "next";

import { CarritoCliente } from "./_components/carrito-cliente";

export const metadata: Metadata = {
  title: "Carrito · Ofibites",
};

/** Carrito de la empresa activa (Figma 3339:13048 con productos, 3390:2397 vacío). */
export default function CarritoPage() {
  return <CarritoCliente />;
}
