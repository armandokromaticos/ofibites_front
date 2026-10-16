import Link from "next/link";

import { cn } from "@heroui/react";
import { CircleCheck, Info } from "lucide-react";

import { MlFormAlert } from "@/ui/atomic";

import { RUTA_CARRITO, RUTA_ORDENAR } from "../../../_navegacion";

export type ResultadoCompra =
  | { tipo: "exito"; descripcion: string }
  /** `noDisponible`: el producto, tamaño o combo ya no se vende; se ofrece volver a Ordenar. */
  | { tipo: "error"; mensaje: string; noDisponible?: boolean }
  /** El producto tiene modificadores obligatorios: la ficha aún no deja elegirlos. */
  | { tipo: "aviso" };

const ENLACE =
  "rounded-sm font-bold text-primary underline decoration-1 underline-offset-[3px] hover:decoration-2 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const CAJA = "flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-[13px] font-semibold leading-[18px] text-primary";

/**
 * Resultado de "Añadir al carrito", bajo el botón. Éxito y aviso van en una región `status` siempre montada (para
 * que el lector de pantalla los anuncie); el error, en una alerta. Se borra al cambiar el tamaño o la cantidad.
 */
export function AvisoCompra({ resultado }: { resultado: ResultadoCompra | null }) {
  return (
    <>
      <div role="status" className="empty:hidden">
        {resultado?.tipo === "exito" && (
          <div className={cn(CAJA, "ofi-slide-up bg-brand-soft/45")}>
            <CircleCheck aria-hidden="true" className="mt-px size-[18px] shrink-0 text-brand" strokeWidth={2.25} />
            <p className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span>
                <span className="font-bold">Añadido al carrito.</span>{" "}
                <span className="font-medium">{resultado.descripcion}</span>
              </span>
              <Link
                href={RUTA_CARRITO}
                className={ENLACE}
              >
                Ver carrito
              </Link>
            </p>
          </div>
        )}
        {resultado?.tipo === "aviso" && (
          <div className={cn(CAJA, "ofi-slide-up bg-background")}>
            <Info aria-hidden="true" className="mt-px size-[18px] shrink-0 text-brand" strokeWidth={2.25} />
            <p>
              <span className="font-bold">Este producto necesita elegir opciones;</span>{" "}
              <span className="font-medium">pronto podrás hacerlo aquí.</span>
            </p>
          </div>
        )}
      </div>
      {resultado?.tipo === "error" && (
        <MlFormAlert title="No se añadió al carrito." className="ofi-slide-up">
          {resultado.mensaje}
          {resultado.noDisponible && (
            <>
              {" "}
              <Link href={RUTA_ORDENAR} className={ENLACE}>
                Volver a Ordenar
              </Link>
            </>
          )}
        </MlFormAlert>
      )}
    </>
  );
}
