import type { Metadata } from "next";

import { PerfilCliente } from "./_components/perfil-cliente";

export const metadata: Metadata = {
  title: "Mi perfil · Ofibites",
};

export default function PerfilPage() {
  return <PerfilCliente />;
}
