"use client";

import { useMemo, useState } from "react";

import { CloudOff, MapPin } from "lucide-react";

import {
  useCompanyAddressBlockingOrders,
  useCompanyAddresses,
  useCreateCompanyAddress,
  useDeleteCompanyAddress,
  useUpdateCompanyAddress,
} from "@/domain/hooks/company-addresses";
import { CompanyAddress, CreateCompanyAddressRequest, UpdateCompanyAddressRequest } from "@/domain/types";
import { AtButton, AtSkeleton } from "@/ui/atomic/atoms";
import { MlEmptyState } from "@/ui/atomic/molecules";
import { OrAddressCard, OrAddressFormModal, OrAddressFormModalValues, OrDeleteAddressModal } from "@/ui/atomic/organisms";

import { direccionCompleta, lineaReferenciaContacto } from "../../_data/direcciones";
import { ordenarSedes, sedesActivasLabel } from "../_data/direcciones-sedes";
import { mensajeErrorDireccion, mensajeErrorEliminarDireccion } from "../_data/errores-perfil";

/** El Figma no trae campo de país: se manda fijo, igual que el panel de direcciones del checkout. */
const PAIS = "Venezuela";

const VALORES_VACIOS: OrAddressFormModalValues = {
  label: "",
  line1: "",
  city: "",
  state: "",
  reference: "",
  contactName: "",
  contactPhone: "",
  isPrimary: false,
};

type CampoTexto = Exclude<keyof OrAddressFormModalValues, "isPrimary">;
type Errores = Partial<Record<CampoTexto, string>>;

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
  };
}

function validar(valores: OrAddressFormModalValues): Errores {
  const errores: Errores = {};
  if (!valores.label.trim()) errores.label = "Ponle un nombre a la sede.";
  if (!valores.line1.trim()) errores.line1 = "Escribe la dirección.";
  if (!valores.city.trim()) errores.city = "Escribe la ciudad.";
  if (!valores.contactName.trim()) errores.contactName = "Escribe quién recibe el pedido.";
  if (!valores.contactPhone.trim()) errores.contactPhone = "Escribe un teléfono de contacto.";
  return errores;
}

interface ModalSede {
  mode: "create" | "edit";
  /** `null` solo en `create`. */
  id: string | null;
}

interface DireccionesSedesProps {
  /** `COMPANY_ADMIN` de la empresa activa: solo quien puede gestionar sedes ve "Añadir"/"Editar"/"Eliminar"
   * y el switch de sede principal. El resto ve la lista de solo lectura (cálculo igual al del sidebar). */
  isCompanyAdmin: boolean;
}

/**
 * "Direcciones y sedes" de Mi perfil (Figma `3657:2154` lista, `3659:2400` sin sedes, `3658:2193` añadir,
 * `3658:2360` editar, `3659:2271` eliminar). CRUD de `companies/:id/addresses` (ya existente, igual que el
 * panel de direcciones del checkout) con los campos de T-31a (`contactName`/`contactPhone`/`isPrimary`,
 * IMPLEMENTADO); el aviso de "pedidos bloqueantes" del modal de borrado consulta
 * `GET .../addresses/:id/blocking-orders` (T-31a) al abrirse. Depende de que se aplique en Supabase la
 * migración `20261022_direcciones_contacto` (pendiente según BITACORA al escribir esto): sin ella, el CRUD de
 * direcciones falla por completo contra el back real, no solo estos campos nuevos.
 */
export function DireccionesSedes({ isCompanyAdmin }: DireccionesSedesProps) {
  const addressesQuery = useCompanyAddresses();
  const create = useCreateCompanyAddress();
  const update = useUpdateCompanyAddress();
  const remove = useDeleteCompanyAddress();

  const [modal, setModal] = useState<ModalSede | null>(null);
  const [valores, setValores] = useState<OrAddressFormModalValues>(VALORES_VACIOS);
  const [errores, setErrores] = useState<Errores>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [eliminando, setEliminando] = useState<CompanyAddress | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const blockingOrdersQuery = useCompanyAddressBlockingOrders(eliminando?.id ?? null);

  const addresses = useMemo(() => ordenarSedes(addressesQuery.data ?? []), [addressesQuery.data]);
  const isSubmitting = create.isPending || update.isPending;

  const abrirCrear = () => {
    setValores(VALORES_VACIOS);
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

  const cerrarModal = () => {
    if (isSubmitting) return;
    setModal(null);
  };

  const cambiarCampo = <F extends keyof OrAddressFormModalValues>(
    field: F,
    value: OrAddressFormModalValues[F],
  ) => {
    setValores((actual) => ({ ...actual, [field]: value }));
    if (field !== "isPrimary") {
      const campo = field as CampoTexto;
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

    if (modal.mode === "create") {
      const body: CreateCompanyAddressRequest = {
        ...comunes,
        ...(state && { state }),
        ...(reference && { reference }),
      };
      create.mutate(body, {
        onSuccess: () => setModal(null),
        onError: (error) => setFormError(mensajeErrorDireccion(error)),
      });
    } else if (modal.id) {
      // `null` explícito (no `undefined`) para que un campo opcional que se vació quede borrado de verdad.
      const body: UpdateCompanyAddressRequest = {
        ...comunes,
        state: state || null,
        reference: reference || null,
      };
      update.mutate(
        { id: modal.id, body },
        {
          onSuccess: () => setModal(null),
          onError: (error) => setFormError(mensajeErrorDireccion(error)),
        },
      );
    }
  };

  const abrirEliminar = (address: CompanyAddress) => {
    setErrorEliminar(null);
    setEliminando(address);
  };

  const confirmarEliminar = () => {
    if (!eliminando || remove.isPending) return;
    setErrorEliminar(null);
    remove.mutate(eliminando.id, {
      onSuccess: () => setEliminando(null),
      onError: (error) => setErrorEliminar(mensajeErrorEliminarDireccion(error)),
    });
  };

  /** "Eliminar sede" dentro del modal de edición (Figma `3658:2360`): cierra ese modal y abre la confirmación. */
  const eliminarDesdeEdicion = () => {
    if (!modal?.id) return;
    const address = addresses.find((item) => item.id === modal.id);
    if (!address) return;
    setModal(null);
    abrirEliminar(address);
  };

  return (
    <section aria-labelledby="perfil-sedes-titulo" className="flex flex-col rounded-card bg-content1 p-5 sm:p-6">
      <header className="flex flex-col gap-3 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="perfil-sedes-titulo" className="font-display text-xl font-bold leading-7 text-foreground">
            Direcciones y sedes
          </h2>
          <p className="text-xs leading-4 text-muted">Son los puntos de entrega que aparecen al armar un pedido.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {addressesQuery.data && (
            <span className="text-xs font-medium leading-4 text-subtle">{sedesActivasLabel(addresses.length)}</span>
          )}
          {isCompanyAdmin && (
            <AtButton size="sm" className="px-4 text-[13px]" onPress={abrirCrear}>
              Añadir sede
            </AtButton>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4 pt-5">
        {addressesQuery.isPending ? (
          <div aria-busy="true" className="flex flex-col gap-3">
            <span className="sr-only">Cargando tus sedes…</span>
            <AtSkeleton className="h-28 rounded-card" />
            <AtSkeleton className="h-28 rounded-card" />
          </div>
        ) : addressesQuery.isError ? (
          <MlEmptyState
            tone="error"
            headingLevel={3}
            icon={<CloudOff />}
            title="No pudimos cargar las sedes"
            description="Puede ser un problema de conexión. Vuelve a intentarlo en unos segundos."
            actionLabel="Reintentar"
            onAction={() => addressesQuery.refetch()}
            isActionLoading={addressesQuery.isFetching}
          />
        ) : addresses.length === 0 ? (
          <MlEmptyState
            headingLevel={3}
            icon={<MapPin />}
            title="Todavía no hay sedes cargadas"
            description={
              isCompanyAdmin
                ? "Añade la primera sede para que tu empresa pueda elegirla al armar un pedido."
                : "Pídele a tu administrador de empresa que cargue la primera sede de entrega."
            }
            actionLabel={isCompanyAdmin ? "Añadir sede" : undefined}
            onAction={isCompanyAdmin ? abrirCrear : undefined}
          />
        ) : (
          addresses.map((address) => (
            <OrAddressCard
              key={address.id}
              label={address.label}
              isPrimary={address.isPrimary ?? false}
              addressLine={direccionCompleta(address)}
              referenceContactLine={lineaReferenciaContacto(address)}
              canManage={isCompanyAdmin}
              onEdit={() => abrirEditar(address)}
              onDelete={() => abrirEliminar(address)}
            />
          ))
        )}
      </div>

      <p className="mt-5 flex items-start gap-3 rounded-2xl bg-surface-sand/50 px-4 py-3.5 text-xs leading-[18px] text-foreground">
        <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
        Las sedes las ve toda la empresa y solo el administrador puede editarlas. Si eliminas una, los
        pedidos ya hechos conservan la dirección con la que se entregaron.
      </p>

      <OrAddressFormModal
        isOpen={modal !== null}
        mode={modal?.mode ?? "create"}
        values={valores}
        errors={errores}
        onChange={cambiarCampo}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={guardar}
        onClose={cerrarModal}
        onDeleteClick={modal?.mode === "edit" ? eliminarDesdeEdicion : undefined}
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
    </section>
  );
}
