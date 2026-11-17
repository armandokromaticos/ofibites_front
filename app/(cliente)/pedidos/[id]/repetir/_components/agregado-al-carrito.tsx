"use client";

import Image from "next/image";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import { modalMotionProps } from "@/shared/motion";
import { AtButton, AtModal } from "@/ui/atomic";

export interface FilaAgregado {
  label: string;
  value: string;
}

interface AgregadoAlCarritoProps {
  isOpen: boolean;
  onClose: () => void;
  /** Filas del resumen ("Sede", "Cajas", "Total"). */
  filas: FilaAgregado[];
  /** Productos que no se pudieron agregar (`skipped`), ya redactado. */
  aviso?: string | null;
  onIrAlCheckout: () => void;
  onSeguirEnCatalogo: () => void;
}

/**
 * "Está en tu carrito" (Figma 3731:3396), tras `POST /cart/repeat/:orderId`. Sin la fila "Entrega": la fecha y la hora
 * se eligen en el checkout (decisión del usuario, DECISIONES 2026-11-17).
 */
export function AgregadoAlCarrito(props: AgregadoAlCarritoProps) {
  const { isOpen, onClose, filas, aviso, onIrAlCheckout, onSeguirEnCatalogo } = props;
  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="center"
      size="md"
      hideCloseButton
      motionProps={modalMotionProps}
      classNames={{
        wrapper: "px-4",
        base: "mx-0 max-w-[500px] rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-4 px-8 pb-2 pt-8 text-center">
          <span aria-hidden="true" className="relative size-16">
            <Image src="/images/empty/tomate.png" alt="" fill sizes="64px" className="object-contain" />
          </span>
          <span className="font-display text-[22px] font-bold leading-7 text-foreground">Está en tu carrito</span>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4 px-8 py-1">
          <p className="text-center text-[13px] leading-5 text-ghost-foreground">
            Todavía no se envió. Confirma en el carrito para que Ofibites lo reciba.
          </p>
          <dl className="flex flex-col gap-1.5 rounded-2xl bg-background px-4 py-3 text-xs leading-5">
            {filas.map((fila) => (
              <div key={fila.label} className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">{fila.label}</dt>
                <dd className="text-right font-semibold text-foreground">{fila.value}</dd>
              </div>
            ))}
          </dl>
          {aviso && <p className="rounded-control bg-secondary-100 px-4 py-3 text-xs leading-[18px] text-secondary-700">{aviso}</p>}
        </ModalBody>
        <ModalFooter className="flex flex-col-reverse gap-3 px-8 pb-8 pt-5 sm:flex-row">
          <AtButton
            size="lg"
            variant="bordered"
            className="h-12 flex-1 border-primary text-sm text-primary"
            onPress={onSeguirEnCatalogo}
          >
            Seguir en el catálogo
          </AtButton>
          <AtButton size="lg" className="h-12 flex-1 text-sm" onPress={onIrAlCheckout}>
            Ir al checkout
          </AtButton>
        </ModalFooter>
      </ModalContent>
    </AtModal>
  );
}
