"use client";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import { AtButton, AtInput, AtModal, AtSwitch } from "@/ui/atomic/atoms";
import { MlFormAlert } from "@/ui/atomic/molecules";

import { OrAddressFormModalField, OrAddressFormModalProps, OrAddressFormModalValues } from "./or-address-form-modal.types";

const CLASES_CAMPO = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  inputWrapper: "h-11 bg-background",
  input: "text-sm font-normal",
};

/** Límites de `Create`/`UpdateCompanyAddressDto` (T-31a incluido: `contactName` ≤ 150, `contactPhone` ≤ 30). */
const MAXIMOS: Record<Exclude<OrAddressFormModalField, "isPrimary">, number> = {
  label: 150,
  line1: 255,
  city: 150,
  state: 150,
  reference: 500,
  contactName: 150,
  contactPhone: 30,
};

/**
 * "Añadir sede" (Figma `3658:2193`) / "Editar sede" (`3658:2360`): nombre, dirección, ciudad, estado (opcional),
 * punto de referencia (opcional), quién recibe, teléfono de contacto y el switch "Marcar como sede principal".
 * Sin campo de país (el que la usa manda `country: "Venezuela"` fijo) ni de línea 2, ni de facturación/envío:
 * no están en este formulario del Figma. La validación de campos vive en quien usa el modal (mismo patrón que
 * `OrMemberForm`): este componente solo pinta `values`/`errors` y llama a `onSubmit` sin validar de más.
 */
export function OrAddressFormModal({
  isOpen,
  mode,
  values,
  errors = {},
  onChange,
  formError,
  isSubmitting = false,
  onSubmit,
  onClose,
  onDeleteClick,
}: OrAddressFormModalProps) {
  const isCreate = mode === "create";

  const campo = (field: Exclude<OrAddressFormModalField, "isPrimary">) => ({
    name: field,
    value: values[field],
    onValueChange: (value: string) => onChange(field, value as OrAddressFormModalValues[typeof field]),
    isInvalid: Boolean(errors[field]),
    errorMessage: errors[field],
    isReadOnly: isSubmitting,
    maxLength: MAXIMOS[field],
    classNames: CLASES_CAMPO,
  });

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
      placement="center"
      scrollBehavior="outside"
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: "mx-0 my-8 max-w-[560px] rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
          <h2 className="font-display text-[22px] font-bold leading-7 text-foreground">
            {isCreate ? "Añadir sede" : "Editar sede"}
          </h2>
          <p className="text-xs font-normal leading-4 text-muted">
            {isCreate
              ? "Esta dirección queda disponible para toda la empresa al armar un pedido."
              : "Los cambios aplican a los pedidos nuevos. Los pedidos ya entregados conservan la dirección con la que salieron."}
          </p>
        </ModalHeader>
        <ModalBody className="gap-4 px-5 pb-0 pt-4 sm:px-7">
          <div className="border-t border-divider" />
          {formError && <MlFormAlert title="No pudimos guardar la sede.">{formError}</MlFormAlert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <AtInput {...campo("label")} label="Nombre de la sede" labelPlacement="outside-top" placeholder="Ej. Torre Principal" isRequired />
            <AtInput {...campo("city")} label="Ciudad" labelPlacement="outside-top" isRequired />
          </div>
          <AtInput
            {...campo("line1")}
            label="Dirección"
            labelPlacement="outside-top"
            placeholder="Av. / calle, edificio, piso y oficina"
            isRequired
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AtInput {...campo("state")} label="Estado" labelPlacement="outside-top" />
            <AtInput
              {...campo("reference")}
              label="Punto de referencia"
              labelPlacement="outside-top"
              placeholder="Ej. entrada por el lobby norte"
              description="Ayuda al repartidor a llegar sin llamar."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AtInput
              {...campo("contactName")}
              label="Quién recibe"
              labelPlacement="outside-top"
              placeholder="Nombre y apellido"
              isRequired
            />
            <AtInput
              {...campo("contactPhone")}
              type="tel"
              label="Teléfono de contacto"
              labelPlacement="outside-top"
              placeholder="+58 ___ ___ ____"
              isRequired
            />
          </div>

          <AtSwitch
            isSelected={values.isPrimary}
            onValueChange={(value) => onChange("isPrimary", value)}
            isDisabled={isSubmitting}
            classNames={{ label: "text-sm font-medium text-foreground" }}
          >
            Marcar como sede principal
          </AtSwitch>
        </ModalBody>
        <ModalFooter className="mt-4 flex-wrap items-center gap-3 border-t border-divider px-5 pb-6 pt-4 sm:mx-7 sm:px-0 sm:pb-7">
          {!isCreate && onDeleteClick ? (
            <AtButton
              size="lg"
              variant="bordered"
              color="danger"
              className="h-12 border-danger-500 px-6 text-sm text-danger-600 sm:mr-auto"
              isDisabled={isSubmitting}
              onPress={onDeleteClick}
            >
              Eliminar sede
            </AtButton>
          ) : null}
          <div className="ml-auto flex gap-3">
            <AtButton
              size="lg"
              variant="bordered"
              className="h-12 border-primary px-6 text-sm text-primary aria-disabled:opacity-50"
              aria-disabled={isSubmitting || undefined}
              onPress={() => {
                if (!isSubmitting) onClose();
              }}
            >
              Cancelar
            </AtButton>
            <AtButton size="lg" className="h-12 px-6 text-sm" isLoading={isSubmitting} onPress={onSubmit}>
              {isCreate ? "Guardar dirección" : "Guardar cambios"}
            </AtButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </AtModal>
  );
}
