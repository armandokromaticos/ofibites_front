"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { useCreateCompanyAddress } from "@/domain/hooks/company-addresses";
import { CompanyAddress } from "@/domain/types";
import { getApiErrorMessage, isApiError } from "@/shared/utils";
import { AtButton, AtInput, MlFormAlert } from "@/ui/atomic";

import { CLASES_CAMPO } from "./campos";

interface Valores {
  label: string;
  line1: string;
  city: string;
  reference: string;
  contactName: string;
  contactPhone: string;
}

type Errores = Partial<Record<keyof Valores, string>>;

/** Límites de `CreateCompanyAddressDto` (`contactName`/`contactPhone` de T-31a, obligatorios al crear). */
const MAXIMOS: Record<keyof Valores, number> = {
  label: 150,
  line1: 255,
  city: 150,
  reference: 500,
  contactName: 150,
  contactPhone: 30,
};

const PAIS = "Venezuela";

function validar(valores: Valores): Errores {
  const errores: Errores = {};
  if (!valores.label.trim()) errores.label = "Ponle un nombre a la sede.";
  if (!valores.line1.trim()) errores.line1 = "Escribe la dirección.";
  if (!valores.city.trim()) errores.city = "Escribe la ciudad.";
  if (!valores.contactName.trim()) errores.contactName = "Escribe quién recibe el pedido.";
  if (!valores.contactPhone.trim()) errores.contactPhone = "Escribe un teléfono de contacto.";
  for (const campo of Object.keys(MAXIMOS) as (keyof Valores)[]) {
    if (valores[campo].trim().length > MAXIMOS[campo]) errores[campo] = `Máximo ${MAXIMOS[campo]} caracteres.`;
  }
  return errores;
}

function mensajeError(error: unknown): string {
  if (isApiError(error) && error.statusCode === 403) {
    return "Solo el administrador de tu empresa puede agregar direcciones.";
  }
  if (isApiError(error) && error.statusCode === 400) return "Revisa los datos de la dirección.";
  return getApiErrorMessage(error, "No pudimos guardar la dirección. Inténtalo de nuevo.");
}

interface NuevaDireccionProps {
  /** La dirección se guardó: la página la elige y cierra el panel. */
  onCreated: (address: CompanyAddress) => void;
  onCancel: () => void;
  /**
   * "Quién recibe"/teléfono ya escritos un paso antes en el checkout (`receiverName`/`receiverPhone`): se
   * precargan aquí para no pedirlos dos veces, pero siguen editables (la sede puede recibirla otra persona).
   */
  defaultContactName?: string;
  defaultContactPhone?: string;
}

/**
 * "+ Agregar otra dirección" (solo COMPANY_ADMIN): panel en línea, no un modal, para no sacar al usuario del paso.
 * No es un `<form>` (no puede ir dentro del formulario del checkout): Enter en un campo guarda, y "Guardar dirección"
 * es un botón normal. La sede nueva queda en la agenda de la empresa (`POST /companies/:id/addresses`).
 */
export function NuevaDireccion({
  onCreated,
  onCancel,
  defaultContactName = "",
  defaultContactPhone = "",
}: NuevaDireccionProps) {
  const create = useCreateCompanyAddress();
  const [valores, setValores] = useState<Valores>({
    label: "",
    line1: "",
    city: "Caracas",
    reference: "",
    contactName: defaultContactName,
    contactPhone: defaultContactPhone,
  });
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.querySelector<HTMLInputElement>("input[name='nueva-direccion-label']")?.focus();
  }, []);

  const cambiar = (campo: keyof Valores, valor: string) => {
    setValores((actual) => ({ ...actual, [campo]: valor }));
    if (errores[campo]) setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const guardar = () => {
    if (create.isPending) return;
    const nuevos = validar(valores);
    setErrores(nuevos);
    const primero = (Object.keys(MAXIMOS) as (keyof Valores)[]).find((campo) => nuevos[campo]);
    if (primero) {
      panel.current?.querySelector<HTMLInputElement>(`input[name='nueva-direccion-${primero}']`)?.focus();
      return;
    }
    setError(null);
    const reference = valores.reference.trim();
    create
      .mutateAsync({
        label: valores.label.trim(),
        line1: valores.line1.trim(),
        city: valores.city.trim(),
        country: PAIS,
        isShipping: true,
        contactName: valores.contactName.trim(),
        contactPhone: valores.contactPhone.trim(),
        ...(reference && { reference }),
      })
      .then(onCreated)
      .catch((err: unknown) => setError(mensajeError(err)));
  };

  const alPulsarTecla = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      guardar();
    }
    if (event.key === "Escape") onCancel();
  };

  const campo = (
    nombre: keyof Valores,
    label: string,
    extra?: { placeholder?: string; isRequired?: boolean },
  ) => (
    <AtInput
      name={`nueva-direccion-${nombre}`}
      label={label}
      labelPlacement="outside-top"
      placeholder={extra?.placeholder}
      value={valores[nombre]}
      onValueChange={(valor) => cambiar(nombre, valor)}
      isInvalid={Boolean(errores[nombre])}
      errorMessage={errores[nombre]}
      aria-required={extra?.isRequired || undefined}
      validationBehavior="aria"
      maxLength={MAXIMOS[nombre]}
      classNames={CLASES_CAMPO}
    />
  );

  return (
    <div
      ref={panel}
      role="group"
      aria-labelledby="nueva-direccion-titulo"
      onKeyDown={alPulsarTecla}
      className="flex flex-col gap-4 rounded-control bg-background p-4 sm:p-5"
    >
      <p id="nueva-direccion-titulo" className="text-sm font-semibold leading-5 text-foreground">
        Nueva sede de entrega
      </p>
      {error && <MlFormAlert>{error}</MlFormAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        {campo("label", "Nombre de la sede", { placeholder: "Ej.: Sede La Castellana", isRequired: true })}
        {campo("city", "Ciudad", { isRequired: true })}
      </div>
      {campo("line1", "Dirección", { placeholder: "Av. Principal de La Castellana, Torre BNC", isRequired: true })}
      {campo("reference", "Punto de referencia de la sede (opcional)", { placeholder: "Frente a la plaza" })}
      <div className="grid gap-4 sm:grid-cols-2">
        {campo("contactName", "Quién recibe", { placeholder: "Nombre y apellido", isRequired: true })}
        {campo("contactPhone", "Teléfono de contacto", { placeholder: "+58 ___ ___ ____", isRequired: true })}
      </div>
      <p className="text-xs leading-[18px] text-muted">
        Queda guardada en la agenda de tu empresa para próximos pedidos.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <AtButton size="sm" variant="light" color="default" className="text-ghost-foreground" onPress={onCancel}>
          Cancelar
        </AtButton>
        <AtButton size="sm" className="px-5" onPress={guardar} isLoading={create.isPending}>
          Guardar dirección
        </AtButton>
      </div>
    </div>
  );
}
