"use client";

import { useId, useMemo, useState } from "react";

import { MapPin, Plus } from "lucide-react";

import {
  useCompanyAddressBlockingOrders,
  useCreateCompanyAddress,
  useDeleteCompanyAddress,
  useUpdateCompanyAddress,
} from "@/domain/hooks/company-addresses";
import { COMPANY_ADDRESS_TYPE_LABELS } from "@/domain/models";
import { CompanyAddress, CreateCompanyAddressRequest, UpdateCompanyAddressRequest } from "@/domain/types";
import { direccionCompleta, lineaReferenciaContacto } from "@/app/(cliente)/_data/direcciones";
import {
  AtButton,
  MlEmptyState,
  OrAddressCard,
  OrAddressFormModal,
  OrAddressFormModalErrors,
  OrAddressFormModalTextField,
  OrAddressFormModalValues,
  OrDeleteAddressModal,
} from "@/ui/atomic";

import { mensajeErrorEliminarSede, mensajeErrorSede, sedesLabel } from "../_data/onboarding";

import { useGuardaDobleClic } from "./use-guarda-doble-clic";

/** El Figma no trae país: fijo, como en Mi perfil y el checkout. */
const PAIS = "Venezuela";

function valoresVacios(esPrimera: boolean): OrAddressFormModalValues {
  // La primera sede queda como principal; el Figma marca «Oficina» por defecto.
  return {
    label: "",
    line1: "",
    city: "",
    state: "",
    reference: "",
    contactName: "",
    contactPhone: "",
    isPrimary: esPrimera,
    type: "OFFICE",
  };
}

function valoresDesdeDireccion(address: CompanyAddress): OrAddressFormModalValues {
  return {
    label: address.label,
    line1: address.line1,
    city: address.city,
    state: address.state ?? "",
    reference: address.reference ?? "",
    contactName: address.contactName ?? "",
    contactPhone: address.contactPhone ?? "",
    isPrimary: address.isPrimary ?? false,
    type: address.type ?? null,
  };
}

/** Mismos requeridos que «Direcciones y sedes» de Mi perfil (los del DTO del back). */
function validar(valores: OrAddressFormModalValues): OrAddressFormModalErrors {
  const errores: OrAddressFormModalErrors = {};
  if (!valores.label.trim()) errores.label = "Ponle un nombre a la sede.";
  if (!valores.line1.trim()) errores.line1 = "Escribe la dirección.";
  if (!valores.city.trim()) errores.city = "Escribe la ciudad.";
  if (!valores.contactName.trim()) errores.contactName = "Escribe quién recibe el pedido.";
  if (!valores.contactPhone.trim()) errores.contactPhone = "Escribe un teléfono de contacto.";
  return errores;
}

interface PasoSedesProps {
  addresses: CompanyAddress[];
  isRefreshing: boolean;
  onContinue: () => void;
}

/**
 * Paso 2 (Figma `3247:12801` vacío, `3392:2924` agregar, `3392:3025` con sede): las sedes son las direcciones de la
 * empresa (T-31) con su `type` (T-34). Hace falta al menos una para continuar. Reutiliza `OrAddressFormModal`,
 * `OrAddressCard` y `OrDeleteAddressModal` de Mi perfil.
 */
export function PasoSedes({ addresses, isRefreshing, onContinue }: PasoSedesProps) {
  const id = useId();
  const create = useCreateCompanyAddress();
  const update = useUpdateCompanyAddress();
  const remove = useDeleteCompanyAddress();
  const esDobleClic = useGuardaDobleClic();

  const [modal, setModal] = useState<{ mode: "create" | "edit"; id: string | null } | null>(null);
  const [valores, setValores] = useState<OrAddressFormModalValues>(() => valoresVacios(true));
  const [errores, setErrores] = useState<OrAddressFormModalErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [errorContinuar, setErrorContinuar] = useState<string | null>(null);

  const [eliminando, setEliminando] = useState<CompanyAddress | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const blockingOrdersQuery = useCompanyAddressBlockingOrders(eliminando?.id ?? null);

  const sedes = useMemo(
    () =>
      [...addresses].sort(
        (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)) || a.label.localeCompare(b.label, "es"),
      ),
    [addresses],
  );
  const isSubmitting = create.isPending || update.isPending;
  const errorContinuarId = `${id}-error`;

  const abrirCrear = () => {
    setValores(valoresVacios(sedes.length === 0));
    setErrores({});
    setFormError(null);
    setModal({ mode: "create", id: null });
  };

  const abrirEditar = (address: CompanyAddress) => {
    setValores(valoresDesdeDireccion(address));
    setErrores({});
    setFormError(null);
    setModal({ mode: "edit", id: address.id });
  };

  const cambiarCampo = <F extends keyof OrAddressFormModalValues>(
    field: F,
    value: OrAddressFormModalValues[F],
  ) => {
    setValores((actual) => ({ ...actual, [field]: value }));
    if (field !== "isPrimary" && field !== "type") {
      const campo = field as OrAddressFormModalTextField;
      if (errores[campo]) setErrores((actual) => ({ ...actual, [campo]: undefined }));
    }
  };

  const guardar = () => {
    if (!modal || isSubmitting) return;
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setFormError(null);
    const comunes = {
      label: valores.label.trim(),
      line1: valores.line1.trim(),
      city: valores.city.trim(),
      country: PAIS,
      isShipping: true,
      contactName: valores.contactName.trim(),
      contactPhone: valores.contactPhone.trim(),
      isPrimary: valores.isPrimary,
    };
    const state = valores.state.trim();
    const reference = valores.reference.trim();
    const alFallar = (error: unknown) => setFormError(mensajeErrorSede(error));

    if (modal.mode === "create") {
      const body: CreateCompanyAddressRequest = {
        ...comunes,
        ...(valores.type && { type: valores.type }),
        ...(state && { state }),
        ...(reference && { reference }),
      };
      create
        .mutateAsync(body)
        .then(() => {
          setModal(null);
          setErrorContinuar(null);
        })
        .catch(alFallar);
    } else if (modal.id) {
      const body: UpdateCompanyAddressRequest = {
        ...comunes,
        state: state || null,
        reference: reference || null,
        type: valores.type,
      };
      update
        .mutateAsync({ id: modal.id, body })
        .then(() => setModal(null))
        .catch(alFallar);
    }
  };

  const confirmarEliminar = () => {
    if (!eliminando || remove.isPending) return;
    setErrorEliminar(null);
    remove
      .mutateAsync(eliminando.id)
      .then(() => setEliminando(null))
      .catch((error: unknown) => setErrorEliminar(mensajeErrorEliminarSede(error)));
  };

  const continuar = () => {
    if (esDobleClic()) return;
    if (sedes.length === 0) {
      setErrorContinuar("Agrega al menos una sede para continuar.");
      return;
    }
    onContinue();
  };

  return (
    <div className="flex w-full flex-col gap-[25px]">
      {sedes.length === 0 ? (
        <div className="rounded-card border border-border-subtle bg-content1">
          <MlEmptyState
            headingLevel={2}
            icon={<MapPin />}
            title="Todavía no tienes sedes"
            description="Agrega al menos una para poder confirmar pedidos. Después puedes sumar todas las que necesites."
            actionLabel="Agregar sede"
            onAction={abrirCrear}
          />
        </div>
      ) : (
        <section aria-labelledby={`${id}-titulo`} aria-busy={isRefreshing || undefined} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id={`${id}-titulo`} className="font-display text-[21px] font-bold leading-7 text-foreground">
              Tus sedes
            </h2>
            <span className="rounded-full bg-secondary-600 px-2.5 py-0.5 text-xs font-semibold leading-4 text-primary-foreground">
              {sedesLabel(sedes.length)}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {sedes.map((address) => (
              <li key={address.id}>
                <OrAddressCard
                  label={address.label}
                  isPrimary={address.isPrimary ?? false}
                  typeLabel={address.type ? COMPANY_ADDRESS_TYPE_LABELS[address.type] : null}
                  addressLine={direccionCompleta(address)}
                  referenceContactLine={lineaReferenciaContacto(address)}
                  canManage
                  onEdit={() => abrirEditar(address)}
                  onDelete={() => {
                    setErrorEliminar(null);
                    setEliminando(address);
                  }}
                  className="border border-border-subtle"
                />
              </li>
            ))}
          </ul>
          <AtButton
            size="sm"
            variant="bordered"
            className="self-start border-primary px-4 text-[13px] text-primary"
            onPress={abrirCrear}
            startContent={<Plus aria-hidden="true" className="size-4" />}
          >
            Agregar sede
          </AtButton>
          <p className="text-[13px] leading-[18px] text-muted">
            Podrás agregar, editar o eliminar sedes cuando quieras desde tu perfil.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-2">
        <AtButton
          size="lg"
          fullWidth
          onPress={continuar}
          aria-describedby={errorContinuar ? errorContinuarId : undefined}
        >
          Continuar paso 3
        </AtButton>
        {errorContinuar && (
          <p
            id={errorContinuarId}
            role="alert"
            className="flex items-center justify-center gap-2 text-[13px] font-semibold text-secondary-600 before:size-[7px] before:shrink-0 before:rounded-full before:bg-accent before:content-['']"
          >
            {errorContinuar}
          </p>
        )}
      </div>

      <OrAddressFormModal
        isOpen={modal !== null}
        mode={modal?.mode ?? "create"}
        title={modal?.mode === "edit" ? "Editar sede" : "Agregar sede"}
        description="Queda disponible para toda tu empresa al armar un pedido."
        createSubmitLabel="Guardar sede"
        values={valores}
        errors={errores}
        onChange={cambiarCampo}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={guardar}
        onClose={() => {
          if (!isSubmitting) setModal(null);
        }}
      />

      <OrDeleteAddressModal
        isOpen={eliminando !== null}
        addressLabel={eliminando?.label ?? ""}
        blockingOrders={blockingOrdersQuery.data}
        isCheckingBlockingOrders={blockingOrdersQuery.isLoading}
        isDeleting={remove.isPending}
        deleteError={errorEliminar}
        onClose={() => {
          if (!remove.isPending) setEliminando(null);
        }}
        onConfirm={confirmarEliminar}
      />
    </div>
  );
}
