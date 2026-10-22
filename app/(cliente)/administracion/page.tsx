import type { Metadata } from "next";

import { AdministracionCliente } from "./_components/administracion-cliente";

export const metadata: Metadata = {
  title: "Administración de usuarios · Ofibites",
};

export default function AdministracionPage() {
  return <AdministracionCliente />;
}
