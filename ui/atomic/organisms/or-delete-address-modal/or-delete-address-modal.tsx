"use client";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { TriangleAlert } from "lucide-react";

import { formatCaracasDateSlash } from "@/shared/utils";
import { AtButton, AtModal } from "@/ui/atomic/atoms";
import { MlFormAlert } from "@/ui/atomic/molecules";

import { OrDeleteAddressModalProps } from "./or-delete-address-modal.types";

/**
 * Confirmación de "Eliminar sede" (Figma `3659:2271`). Si hay pedidos en curso que la usan (`blockingOrders`,
 * `GET .../addresses/:id/blocking-orders`, T-31a), se muestra el detalle exacto del Figma: "Hay N pedido(s)
 * programado(s) para esta sede" + cada pedido con su fecha de entrega. El back sigue siendo el gate real y
 * rechaza con 409 si corresponde, mostrado con `deleteError` (puede pasar aunque este aviso no haya salido,
 * por una carrera entre leer el endpoint y confirmar).
 */
export function OrDeleteAddressModal({
  isOpen,
  addressLabel,
  blockingOrders,
  isCheckingBlockingOrders = false,
  isDeleting = false,
  deleteError,
  onClose,
  onConfirm,
}: OrDeleteAddressModalProps) {
  const pedidos = blockingOrders ?? [];
  const hayBloqueantes = pedidos.length > 0;

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
      placement="center"
      size="sm"
      isDismissable={!isDeleting}
      isKeyboardDismissDisabled={isDeleting}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: "mx-0 rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent role="alertdialog">
        <ModalHeader className="px-6 pb-1 pt-6 font-display text-[22px] font-bold leading-7 text-foreground">
          ¿Eliminar Sede {addressLabel}?
        </ModalHeader>
        <ModalBody className="flex flex-col gap-3 px-6 py-2">
          <p className="text-sm leading-[22px] text-muted">
            Dejará de aparecer al armar pedidos. Los pedidos ya entregados conservan la dirección con la
            que salieron.
          </p>
          {isCheckingBlockingOrders && (
            <p role="status" className="text-xs leading-4 text-muted">
              Comprobando si hay pedidos programados para esta sede…
            </p>
          )}
          {hayBloqueantes && (
            <div className="flex flex-col gap-1.5 rounded-control bg-danger-50 px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold leading-4 text-danger-700">
                <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
                Hay {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} programado
                {pedidos.length === 1 ? "" : "s"} para esta sede
              </p>
              <ul className="flex flex-col gap-0.5 pl-6 text-xs leading-4 text-danger-700">
                {pedidos.map((order, index) => (
                  <li key={`${order.orderNumber}-${index}`} className="list-disc">
                    Pedido #{order.orderNumber}
                    {order.deliveryDate && `, entrega del ${formatCaracasDateSlash(order.deliveryDate)}`}.
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-4 text-danger-700">
                Cámbialo{pedidos.length === 1 ? "" : "s"} de sede antes de eliminar o quedará
                {pedidos.length === 1 ? "" : "n"} sin dirección de entrega.
              </p>
            </div>
          )}
          {deleteError && <MlFormAlert>{deleteError}</MlFormAlert>}
        </ModalBody>
        <ModalFooter className="gap-2 px-6 pb-6 pt-4">
          <AtButton
            size="md"
            variant="light"
            color="default"
            className="text-ghost-foreground"
            onPress={onClose}
            isDisabled={isDeleting}
          >
            Cancelar
          </AtButton>
          <AtButton size="md" color="danger" className="bg-danger-700" onPress={onConfirm} isLoading={isDeleting}>
            Eliminar sede
          </AtButton>
        </ModalFooter>
      </ModalContent>
    </AtModal>
  );
}
