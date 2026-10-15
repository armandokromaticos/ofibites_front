import { Utensils } from "lucide-react";

import { MlEmptyState } from "@/ui/atomic";

import { CategoriaOrdenar, CATEGORIAS_ORDENAR, RUTA_DASHBOARD } from "../../_navegacion";

interface OrdenarProvisionalProps {
  categoria?: CategoriaOrdenar;
  /** Pedido que se quiere repetir ("Repetir" del dashboard). */
  repetir?: string;
}

// Provisional: la pantalla real llega con T-19. Sin productos ni precios: solo el aviso y la vuelta.
// Sidebar y top bar los pone el layout de `(cliente)`.
export function OrdenarProvisional({ categoria, repetir }: OrdenarProvisionalProps) {
  const catalogo = categoria ? CATEGORIAS_ORDENAR[categoria] : "surtidos";

  return (
    <div className="flex items-start justify-center">
      <div className="w-full max-w-xl rounded-card bg-content1">
        <MlEmptyState
          headingLevel={2}
          icon={<Utensils />}
          // TODO: repetir pedido (T-19). Con el catálogo real, "Repetir" precargará el carrito con este pedido.
          title={repetir ? `Muy pronto podrás repetir el pedido #${repetir} desde aquí` : "Muy pronto podrás ordenar desde aquí"}
          description={
            repetir
              ? "Estamos preparando el catálogo para que puedas pedir lo mismo con un clic."
              : `Estamos preparando el catálogo de ${catalogo}.`
          }
          actionLabel="Volver al dashboard"
          actionHref={RUTA_DASHBOARD}
        />
      </div>
    </div>
  );
}
