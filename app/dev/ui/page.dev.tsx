import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UiCatalog } from "./ui-catalog";

export const metadata: Metadata = {
  title: "Catálogo de componentes · Ofibites",
  robots: { index: false, follow: false },
};

/** Catálogo de desarrollo del design system (T-02). En producción responde 404. */
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <UiCatalog />;
}
