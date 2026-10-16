"use client";

import { useId } from "react";
import Image from "next/image";

import { cn, ModalContent, ModalHeader } from "@heroui/react";
import { X } from "lucide-react";

import { AtModal } from "@/ui/atomic/atoms";

import { OrBoxDetailsModalProps, OrBoxDetailsNutrition } from "./or-box-details-modal.types";

const NUMERO = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 1 });

// Orden y textos del Figma (3163:3051).
const FILAS_NUTRICION: { key: keyof OrBoxDetailsNutrition; label: string; unidad: string }[] = [
  { key: "energyKj", label: "Energía", unidad: "kJ" },
  { key: "calories", label: "Calorías", unidad: "kcal" },
  { key: "fat", label: "Grasas", unidad: "g" },
  { key: "saturatedFat", label: "Grasas saturadas", unidad: "g" },
  { key: "carbohydrates", label: "Carbohidratos", unidad: "g" },
  { key: "sugar", label: "Azúcar", unidad: "g" },
  { key: "fiber", label: "Fibra alimentaria", unidad: "g" },
  { key: "cholesterolMg", label: "Colesterol", unidad: "mg" },
  { key: "sodiumMg", label: "Sodio", unidad: "mg" },
];

const TITULO = "font-display text-[26px] font-extrabold leading-8 text-primary";
const PANEL = "rounded-[18px] bg-content1";

/**
 * Pop-up "Detalles de la caja" (Figma 3163:3051): foto a sangre arriba con botón de cerrar circular, ingredientes
 * (imagen redonda y nombre, 2 columnas desde `sm`) e información nutricional (lista de definición). `AtModal` da
 * el motion, la trampa de foco, Esc y la vuelta del foco al botón que lo abrió; el contenido se desplaza dentro y
 * el botón de cerrar queda fijo arriba.
 */
export function OrBoxDetailsModal({
  isOpen,
  onOpenChange,
  productName,
  imageSrc,
  imageAlt = "",
  ingredients,
  nutrition,
}: OrBoxDetailsModalProps) {
  const id = useId();
  const ingredientesId = `${id}-ingredientes`;
  const nutricionId = `${id}-nutricion`;
  // Solo los valores cargados; si no queda ninguno, el bloque dice "Sin información nutricional".
  const filasNutricion = nutrition
    ? FILAS_NUTRICION.flatMap((fila) => {
        const valor = nutrition[fila.key];
        return valor === null ? [] : [{ ...fila, valor }];
      })
    : [];

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        // Márgenes también en `sm`: el tema de HeroUI pone `sm:my-16 sm:mx-6` y el modal desbordaba el wrapper, que
        // también scrollea (doble scroll). `100%` es la altura del wrapper (viewport visual), no `100dvh`.
        base: "mx-0 my-4 sm:mx-0 sm:my-4 max-h-[calc(100%-2rem)] w-full max-w-[782px] overflow-hidden rounded-card bg-background shadow-none",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="sr-only">{`Detalles de la caja: ${productName}`}</ModalHeader>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalles de la caja"
              className={cn(
                "absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full",
                "border-1 border-primary bg-content1/90 text-primary shadow-lift",
                "transition-[background-color,scale] duration-(--duration-instant) ease-out hover:bg-content1 active:scale-95",
                "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content1",
              )}
            >
              <X aria-hidden="true" className="size-5" strokeWidth={2} />
            </button>

            {/* Un `div` y no `ModalBody`: este pondría `aria-describedby` y el lector leería todo el contenido al abrir.
                Enfocable para desplazarlo con el teclado (no tiene otros controles). */}
            <div
              tabIndex={0}
              role="region"
              aria-label="Ingredientes e información nutricional"
              className={cn(
                "flex flex-1 flex-col overflow-y-auto",
                "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
              )}
            >
              <div className="relative aspect-[1564/614] w-full shrink-0 bg-surface-sand">
                <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 820px) 782px, 100vw" className="object-cover" />
              </div>

              <div className="flex flex-col gap-9 px-4 pb-8 pt-7 sm:px-[30px] sm:pb-10">
                <section aria-labelledby={ingredientesId} className="flex flex-col gap-5">
                  <h2 id={ingredientesId} className={TITULO}>
                    Ingredientes
                  </h2>
                  {ingredients.length > 0 ? (
                    <ul
                      className={cn(
                        PANEL,
                        "grid grid-cols-1 gap-x-8 gap-y-4 px-5 py-6 sm:grid-cols-2 sm:gap-y-6 sm:px-[70px] sm:py-8",
                      )}
                    >
                      {ingredients.map((ingrediente) => (
                        <li key={ingrediente.id} className="flex items-center gap-4">
                          <span className="relative flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
                            {ingrediente.imageSrc ? (
                              <Image src={ingrediente.imageSrc} alt="" fill sizes="46px" className="object-contain" />
                            ) : (
                              <span aria-hidden="true" className="text-sm font-bold text-brand">
                                {ingrediente.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className="text-sm font-bold leading-5 text-foreground">{ingrediente.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-[22px] text-muted">Aún no hay ingredientes cargados para este producto.</p>
                  )}
                </section>

                <section aria-labelledby={nutricionId} className="flex flex-col gap-5">
                  <h2 id={nutricionId} className={TITULO}>
                    Información nutricional
                  </h2>
                  {filasNutricion.length > 0 ? (
                    <dl className={cn(PANEL, "grid grid-cols-1 gap-x-12 px-5 py-2 sm:grid-cols-2 sm:px-[30px] sm:py-4")}>
                      {filasNutricion.map(({ key, label, unidad, valor }) => (
                        <div
                          key={key}
                          className="flex items-baseline justify-between gap-4 border-b border-divider py-3 last:border-b-0"
                        >
                          <dt className="text-sm font-bold leading-5 text-foreground">{label}</dt>
                          <dd className="text-sm font-medium tabular-nums leading-5 text-foreground">
                            {`${NUMERO.format(valor)} ${unidad}`}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm leading-[22px] text-muted">Sin información nutricional.</p>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </ModalContent>
    </AtModal>
  );
}
