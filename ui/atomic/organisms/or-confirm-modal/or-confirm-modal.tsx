"use client";

import { cn, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

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
  size = "sm",
  children,
}: OrConfirmModalProps) {
  const isLarge = size === "lg";
  // Botones del Figma 3568:1799 en `lg`: 45 px, Inter 600 14 px (Cancelar 22 px de padding, la acción 26 px).
  const boton = isLarge ? "h-[45px] text-sm" : undefined;

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="center"
      size={isLarge ? "xl" : "sm"}
      isDismissable={!isConfirming}
      isKeyboardDismissDisabled={isConfirming}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: cn("mx-0 bg-content1 shadow-popover", isLarge ? "max-w-[560px] rounded-[20px]" : "rounded-card"),
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent role="alertdialog">
        <ModalHeader
          className={cn(
            "font-display text-[22px] font-bold text-foreground",
            isLarge ? "px-7 pb-0 pt-7 leading-[29px]" : "px-6 pb-1 pt-6 leading-7",
          )}
        >
          {title}
        </ModalHeader>
        {(description || children) && (
          <ModalBody className={isLarge ? "gap-[18px] px-7 pb-0 pt-[18px]" : "px-6 py-2"}>
            {description && (
              <p className={cn("text-sm text-muted", isLarge ? "leading-[21px]" : "leading-[22px]")}>{description}</p>
            )}
            {children}
          </ModalBody>
        )}
        <ModalFooter className={isLarge ? "gap-3 px-7 pb-7 pt-[18px]" : "gap-2 px-6 pb-6 pt-4"}>
          <AtButton
            size="md"
            variant="bordered"
            color="primary"
            // Patrón de confirmación del Figma (p. ej. "Eliminar sede" 3659:2271): Cancelar con borde `primary`
            // de 1 px y la acción destructiva en `secondary` (#e64400).
            className={cn("border-1 border-primary text-primary", boton, isLarge && "px-[22px]")}
            onPress={onClose}
            isDisabled={isConfirming}
          >
            {cancelLabel}
          </AtButton>
          <AtButton
            size="md"
            color={isDestructive ? "secondary" : "primary"}
            className={cn(boton, isLarge && "px-[26px]")}
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
