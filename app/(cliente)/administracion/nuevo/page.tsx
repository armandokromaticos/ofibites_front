import type { Metadata } from "next";

import { NuevoUsuario } from "./_components/nuevo-usuario";

export const metadata: Metadata = {
  title: "Añadir usuario · Ofibites",
};

export default function NuevoUsuarioPage() {
  return <NuevoUsuario />;
}
