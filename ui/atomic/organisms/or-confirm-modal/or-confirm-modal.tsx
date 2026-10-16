"use client";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import { AtButton, AtModal } from "@/ui/atomic/atoms";

import { OrConfirmModalProps } from "./or-confirm-modal.types";

/**
 * Confirmación de una acción (p. ej. vaciar el carrito): título, descripción, Cancelar y Confirmar. Mientras
 * confirma no se cierra con Esc ni clic fuera. El foco entra en el modal y vuelve al botón que lo abrió.
 */
export function OrConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  isDestructive = false,
  isConfirming = false,
}: OrConfirmModalProps) {
  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="center"
      size="sm"
      isDismissable={!isConfirming}
      isKeyboardDismissDisabled={isConfirming}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: "mx-0 rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent role="alertdialog">
        <ModalHeader className="px-6 pb-1 pt-6 font-display text-[22px] font-bold leading-7 text-foreground">
          {title}
        </ModalHeader>
        {description && (
          <ModalBody className="px-6 py-2">
            <p className="text-sm leading-[22px] text-muted">{description}</p>
          </ModalBody>
        )}
        <ModalFooter className="gap-2 px-6 pb-6 pt-4">
          <AtButton
            size="md"
            variant="light"
            color="default"
            className="text-ghost-foreground"
            onPress={onClose}
            isDisabled={isConfirming}
          >
            {cancelLabel}
          </AtButton>
          <AtButton
            size="md"
            color={isDestructive ? "danger" : "primary"}
            className={isDestructive ? "bg-danger-700" : undefined}
            onPress={onConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </AtButton>
        </ModalFooter>
      </ModalContent>
    </AtModal>
  );
}
