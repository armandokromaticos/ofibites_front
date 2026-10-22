"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChevronLeft, Clock, Plus } from "lucide-react";

import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import {
  CHECKOUT_CUTOFF_NOTICE,
  CHECKOUT_LIMITS,
  CHECKOUT_SUGGESTED_TIMES,
  CheckoutDraft,
  CheckoutDraftErrors,
  CheckoutDraftField,
  EMPTY_CHECKOUT_DRAFT,
  firstDeliveryDate,
  lastDeliveryDate,
  validateCheckoutDraft,
} from "@/domain/models";
import { useAuthStore, useCheckoutDraftStore } from "@/domain/stores";
import { formatDateOnlyLong, formatPrice, formatWallTime, isApiError, isDateOnly } from "@/shared/utils";
import {
  AtButton,
  AtInput,
  AtSkeleton,
  AtTextarea,
  MlFilterChips,
  MlRadioCardGroup,
  OrOrderSummary,
} from "@/ui/atomic";

import { lineaDireccion } from "../../_data/direcciones";
import { conteoPedido, filasResumenCarrito, lineasResumen } from "../../_data/resumen-pedido";
import { RUTA_CARRITO, RUTA_CHECKOUT_REVISION } from "../../_navegacion";

import { usePropietarioBorrador } from "./borrador";
import { CLASE_AYUDA_BLOQUE, CLASE_TITULO_BLOQUE, CLASES_AREA, CLASES_CAMPO } from "./campos";
import { CabeceraCheckout, EstadoCheckout, RejillaCheckout } from "./marco-checkout";
import { NuevaDireccion } from "./nueva-direccion";
import { useCarritoCheckout } from "./use-carrito-checkout";

const FORM_ID = "checkout-entrega";
const OTRA_HORA = "otra";

/** Orden de los campos en pantalla: el primero con error recibe el foco. */
const ORDEN_CAMPOS: CheckoutDraftField[] = [
  "deliveryDate",
  "deliveryTime",
  "deliveryAddressId",
  "addressDetail",
  "addressReference",
  "receiverName",
  "receiverPhone",
  "notes",
];

const OPCIONES_HORA = [
  ...CHECKOUT_SUGGESTED_TIMES.map((value) => ({ value, label: formatWallTime(value) })),
  { value: OTRA_HORA, label: "Otra hora" },
];

/** Bloque blanco de un paso con su título (h3) y ayuda. */
function Bloque({
  id,
  titulo,
  ayuda,
  children,
}: {
  id: string;
  titulo: string;
  ayuda?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-titulo`} className="flex flex-col gap-5 rounded-card bg-content1 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h3 id={`${id}-titulo`} className={CLASE_TITULO_BLOQUE}>
          {titulo}
        </h3>
        {ayuda && (
          <div id={`${id}-ayuda`} className={CLASE_AYUDA_BLOQUE}>
            {ayuda}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Paso 1 del checkout, "Entrega" (Figma 3462:2094): fecha (con el corte de las 15:00 de Caracas del día anterior),
 * hora con atajos, sede de la agenda (+ agregar otra, solo COMPANY_ADMIN), piso y referencia, quién recibe y notas.
 * Lo escrito se guarda en `useCheckoutDraftStore` a cada cambio: volver desde la revisión (o al carrito) no lo pierde.
 */
export function CheckoutEntrega() {
  // Con otro usuario o empresa activa, el paso se monta de nuevo: no arrastra el borrador ni los errores anteriores.
  const propietario = usePropietarioBorrador();
  return <PasoEntrega key={propietario} />;
}

function PasoEntrega() {
  const router = useRouter();
  const { estado, cart, lines, summary, cartQuery } = useCarritoCheckout();
  const propietario = usePropietarioBorrador();
  const user = useAuthStore((state) => state.user);
  const esAdminEmpresa = useAuthStore(
    (state) => state.memberships.find((m) => m.companyId === state.activeCompanyId)?.role === "COMPANY_ADMIN",
  );
  const addressesQuery = useCompanyAddresses();
  const sedes = (addressesQuery.data ?? []).filter((address) => address.isShipping);

  // Primera fecha que llega al corte, calculada al entrar (al enviar se recalcula por si pasaron las 15:00).
  const [primeraFecha] = useState(() => firstDeliveryDate());
  const [ultimaFecha] = useState(() => lastDeliveryDate());
  const [draft, setDraft] = useState<CheckoutDraft>(() => {
    const guardado = useCheckoutDraftStore.getState();
    if (guardado.draft && guardado.owner === propietario) return guardado.draft;
    return {
      ...EMPTY_CHECKOUT_DRAFT,
      deliveryDate: primeraFecha,
      receiverName: user?.name ?? "",
      receiverPhone: user?.phone ?? "",
    };
  });
  const [errors, setErrors] = useState<CheckoutDraftErrors>({});
  const [otraHora, setOtraHora] = useState(
    () => draft.deliveryTime !== "" && !CHECKOUT_SUGGESTED_TIMES.some((hora) => hora === draft.deliveryTime),
  );
  const [agregando, setAgregando] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const horaRef = useRef<HTMLInputElement>(null);
  const agregarRef = useRef<HTMLButtonElement>(null);
  // Tras guardar una sede nueva, foco a su tarjeta (ya elegida) cuando aparezca en la lista.
  const enfocarSede = useRef<string | null>(null);

  // La sede elegida: la del borrador si sigue en la agenda; si no, la primera.
  const sedeElegida = sedes.some((sede) => sede.id === draft.deliveryAddressId)
    ? draft.deliveryAddressId
    : (sedes[0]?.id ?? "");

  // Se repite al llegar la lista nueva y al cerrar el panel: la sede aparece en uno de los dos renders.
  useEffect(() => {
    const id = enfocarSede.current;
    if (!id) return;
    const radio = formRef.current?.querySelector<HTMLInputElement>(
      `input[name='deliveryAddressId'][value='${id}']`,
    );
    if (radio) {
      radio.focus();
      enfocarSede.current = null;
    }
  }, [addressesQuery.data, agregando]);

  const actualizar = (campo: CheckoutDraftField, valor: string) => {
    setDraft((actual) => {
      const siguiente = { ...actual, [campo]: valor };
      useCheckoutDraftStore.getState().saveDraft(propietario, siguiente, false);
      return siguiente;
    });
    if (errors[campo]) setErrors((actual) => ({ ...actual, [campo]: undefined }));
  };

  const enfocarCampo = (campo: CheckoutDraftField) => {
    const form = formRef.current;
    if (!form) return;
    if (campo === "deliveryAddressId") {
      const radio =
        form.querySelector<HTMLElement>("input[name='deliveryAddressId']:checked") ??
        form.querySelector<HTMLElement>("input[name='deliveryAddressId']");
      if (radio) return radio.focus();
      // Sin sedes: el admin puede agregar una; el resto, al aviso que lo explica.
      if (esAdminEmpresa && agregarRef.current) return agregarRef.current.focus();
      return document.getElementById("checkout-sin-sedes")?.focus();
    }
    form.querySelector<HTMLElement>(`[name='${campo}']`)?.focus();
  };

  const continuar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const final: CheckoutDraft = { ...draft, deliveryAddressId: sedeElegida };
    const nuevos = validateCheckoutDraft(final);
    setErrors(nuevos);
    const primero = ORDEN_CAMPOS.find((campo) => nuevos[campo]);
    if (primero) {
      enfocarCampo(primero);
      return;
    }
    setDraft(final);
    useCheckoutDraftStore.getState().saveDraft(propietario, final, true);
    router.push(RUTA_CHECKOUT_REVISION);
  };

  const elegirHora = (valor: string) => {
    if (valor === OTRA_HORA) {
      setOtraHora(true);
      horaRef.current?.focus();
      return;
    }
    setOtraHora(false);
    actualizar("deliveryTime", valor);
  };

  const cabecera = <CabeceraCheckout paso={1} nombrePaso="Entrega" />;

  if (estado !== "listo" || !cart || !summary) {
    return (
      <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
        {cabecera}
        <EstadoCheckout
          estado={estado}
          onRetry={() => void cartQuery.refetch()}
          isRetrying={cartQuery.isFetching}
        />
      </div>
    );
  }

  // Chip activo: la hora sugerida elegida, "Otra hora" con una hora libre (o al pulsarlo), o ninguno.
  const esSugerida = CHECKOUT_SUGGESTED_TIMES.some((hora) => hora === draft.deliveryTime);
  let chipHora = "";
  if (otraHora || (draft.deliveryTime && !esSugerida)) chipHora = OTRA_HORA;
  else if (esSugerida) chipHora = draft.deliveryTime;

  const fechaLarga = isDateOnly(draft.deliveryDate) ? formatDateOnlyLong(draft.deliveryDate) : null;
  const addressesForbidden = isApiError(addressesQuery.error) && addressesQuery.error.statusCode === 403;

  let contenidoSedes;
  if (addressesQuery.isPending) {
    contenidoSedes = (
      <div role="status" aria-label="Cargando las sedes" className="flex flex-col gap-2.5">
        <AtSkeleton className="h-[68px] rounded-control" />
        <AtSkeleton className="h-[68px] rounded-control" />
      </div>
    );
  } else if (addressesQuery.isError && sedes.length === 0) {
    contenidoSedes = (
      <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-danger-50 px-4 py-3">
        <p className="text-sm leading-5 text-danger-700">
          {addressesForbidden
            ? "Tu usuario no puede ver la agenda de direcciones de esta empresa."
            : "No pudimos cargar las sedes de tu empresa."}
        </p>
        {!addressesForbidden && (
          <AtButton
            size="sm"
            variant="bordered"
            color="default"
            className="border-1 border-border-input text-foreground"
            onPress={() => void addressesQuery.refetch()}
            isLoading={addressesQuery.isFetching}
          >
            Reintentar
          </AtButton>
        )}
      </div>
    );
  } else if (sedes.length === 0) {
    contenidoSedes = (
      <p
        id="checkout-sin-sedes"
        role="alert"
        tabIndex={-1}
        className={errors.deliveryAddressId ? "text-sm font-semibold leading-5 text-secondary-600" : "text-sm leading-5 text-muted"}
      >
        {esAdminEmpresa
          ? "Tu empresa aún no tiene sedes de entrega. Agrega la primera para continuar."
          : "Tu empresa aún no tiene sedes de entrega. Pide al administrador de tu empresa que agregue una para continuar."}
      </p>
    );
  } else {
    contenidoSedes = (
      <MlRadioCardGroup
        name="deliveryAddressId"
        labelledBy="checkout-sede-titulo"
        describedBy="checkout-sede-ayuda"
        options={sedes.map((sede) => ({
          value: sede.id,
          title: sede.label,
          description: lineaDireccion(sede),
        }))}
        value={sedeElegida}
        onChange={(valor) => actualizar("deliveryAddressId", valor)}
        isInvalid={Boolean(errors.deliveryAddressId)}
        errorMessage={errors.deliveryAddressId}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
      {cabecera}
      <RejillaCheckout>
        <div ref={formRef} className="min-w-0">
          <form id={FORM_ID} noValidate onSubmit={continuar} className="flex flex-col gap-4">
            <Bloque
              id="checkout-cuando"
              titulo="¿Cuándo lo entregamos?"
              ayuda={
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                  {CHECKOUT_CUTOFF_NOTICE}
                </span>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <AtInput
                  type="date"
                  name="deliveryDate"
                  label="Fecha de entrega"
                  labelPlacement="outside-top"
                  min={primeraFecha}
                  max={ultimaFecha}
                  value={draft.deliveryDate}
                  onValueChange={(valor) => actualizar("deliveryDate", valor)}
                  description={fechaLarga ?? `Primera fecha disponible: ${formatDateOnlyLong(primeraFecha)}`}
                  isInvalid={Boolean(errors.deliveryDate)}
                  errorMessage={errors.deliveryDate}
                  aria-required="true"
                  validationBehavior="aria"
                  classNames={CLASES_CAMPO}
                />
                <AtInput
                  ref={horaRef}
                  type="time"
                  name="deliveryTime"
                  label="Hora de entrega"
                  labelPlacement="outside-top"
                  value={draft.deliveryTime}
                  onValueChange={(valor) => {
                    setOtraHora(valor !== "" && !CHECKOUT_SUGGESTED_TIMES.some((hora) => hora === valor));
                    actualizar("deliveryTime", valor);
                  }}
                  description={draft.deliveryTime ? `Hora de Caracas: ${formatWallTime(draft.deliveryTime)}` : "Hora de Caracas"}
                  isInvalid={Boolean(errors.deliveryTime)}
                  errorMessage={errors.deliveryTime}
                  aria-required="true"
                  validationBehavior="aria"
                  classNames={CLASES_CAMPO}
                />
              </div>
              <MlFilterChips
                label="Horas sugeridas"
                options={OPCIONES_HORA}
                value={chipHora}
                onChange={elegirHora}
              />
            </Bloque>

            <Bloque id="checkout-sede" titulo="¿Dónde lo recibimos?" ayuda="Tomamos las sedes guardadas en tu agenda.">
              {contenidoSedes}
              {esAdminEmpresa && !agregando && !addressesQuery.isPending && !addressesForbidden && (
                <button
                  ref={agregarRef}
                  type="button"
                  onClick={() => setAgregando(true)}
                  className="inline-flex w-fit items-center gap-1.5 rounded-sm text-xs font-semibold text-secondary-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                  {sedes.length === 0 ? "Agregar una dirección" : "Agregar otra dirección"}
                </button>
              )}
              {agregando && (
                <NuevaDireccion
                  defaultContactName={draft.receiverName}
                  defaultContactPhone={draft.receiverPhone}
                  onCancel={() => {
                    setAgregando(false);
                    // El botón vuelve a montarse en el mismo render: se enfoca en el siguiente.
                    setTimeout(() => agregarRef.current?.focus(), 0);
                  }}
                  onCreated={(sede) => {
                    setAgregando(false);
                    actualizar("deliveryAddressId", sede.id);
                    enfocarSede.current = sede.id;
                  }}
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <AtInput
                  name="addressDetail"
                  label="Piso u oficina"
                  labelPlacement="outside-top"
                  placeholder="Piso 8, oficina 8-B"
                  value={draft.addressDetail}
                  onValueChange={(valor) => actualizar("addressDetail", valor)}
                  isInvalid={Boolean(errors.addressDetail)}
                  errorMessage={errors.addressDetail}
                  maxLength={CHECKOUT_LIMITS.addressDetail}
                  validationBehavior="aria"
                  classNames={CLASES_CAMPO}
                />
                <AtInput
                  name="addressReference"
                  label="Punto de referencia"
                  labelPlacement="outside-top"
                  placeholder="Recepción de la torre"
                  value={draft.addressReference}
                  onValueChange={(valor) => actualizar("addressReference", valor)}
                  isInvalid={Boolean(errors.addressReference)}
                  errorMessage={errors.addressReference}
                  maxLength={CHECKOUT_LIMITS.addressReference}
                  validationBehavior="aria"
                  classNames={CLASES_CAMPO}
                />
              </div>
            </Bloque>

            <Bloque
              id="checkout-quien"
              titulo="¿Quién lo recibe?"
              ayuda="Llamamos a esta persona cuando el pedido llegue al edificio."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <AtInput
                  name="receiverName"
                  label="Nombre y apellido"
                  labelPlacement="outside-top"
                  autoComplete="name"
                  value={draft.receiverName}
                  onValueChange={(valor) => actualizar("receiverName", valor)}
                  isInvalid={Boolean(errors.receiverName)}
                  errorMessage={errors.receiverName}
                  maxLength={CHECKOUT_LIMITS.receiverName.max}
                  aria-required="true"
                  validationBehavior="aria"
                  classNames={CLASES_CAMPO}
                />
                <AtInput
                  type="tel"
                  name="receiverPhone"
                  label="Teléfono de contacto"
                  labelPlacement="outside-top"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+58 412 000 0000"
                  value={draft.receiverPhone}
                  onValueChange={(valor) => actualizar("receiverPhone", valor)}
                  isInvalid={Boolean(errors.receiverPhone)}
                  errorMessage={errors.receiverPhone}
                  maxLength={CHECKOUT_LIMITS.receiverPhone.max}
                  aria-required="true"
                  validationBehavior="aria"
                  classNames={CLASES_CAMPO}
                />
              </div>
              <AtTextarea
                name="notes"
                label="Notas para el equipo de entrega (opcional)"
                labelPlacement="outside-top"
                placeholder="Ej.: avisar en recepción, montar en la sala de juntas del piso 8, no usar maní."
                minRows={3}
                maxRows={8}
                value={draft.notes}
                onValueChange={(valor) => actualizar("notes", valor)}
                isInvalid={Boolean(errors.notes)}
                errorMessage={errors.notes}
                maxLength={CHECKOUT_LIMITS.notes}
                validationBehavior="aria"
                classNames={CLASES_AREA}
              />
            </Bloque>
          </form>
        </div>

        <OrOrderSummary
          titleId="checkout-resumen"
          countLabel={conteoPedido(lines.length, cart.totalUnits)}
          lines={lineasResumen(lines)}
          rows={filasResumenCarrito(summary)}
          totalLabel={formatPrice(summary.total)}
          className="lg:sticky lg:top-0"
        >
          <AtButton type="submit" form={FORM_ID} size="lg" className="h-[52px] w-full text-sm">
            Continuar a la revisión
          </AtButton>
          <Link
            href={RUTA_CARRITO}
            className="inline-flex items-center justify-center gap-1 self-center rounded-sm text-[13px] font-medium text-ghost-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Volver al carrito
          </Link>
          <p className="flex gap-2 text-[11px] leading-4 text-muted before:mt-1.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-brand before:content-['']">
            Todavía no se cobra nada. En el paso siguiente revisas el pedido antes de confirmarlo.
          </p>
        </OrOrderSummary>
      </RejillaCheckout>
    </div>
  );
}
