import type { Metadata } from "next";

import { EditarUsuario } from "./_components/editar-usuario";

export const metadata: Metadata = {
  title: "Editar usuario · Ofibites",
};

interface EditarUsuarioPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarUsuarioPage({ params }: EditarUsuarioPageProps) {
  const { id } = await params;
  return <EditarUsuario id={id} />;
}
