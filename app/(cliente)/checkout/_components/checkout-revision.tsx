"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChevronLeft, Info } from "lucide-react";

import { useCheckout, useFindCheckoutOrder } from "@/domain/hooks/checkout";
import { useActiveCompany } from "@/domain/hooks/companies";
import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { useCheckoutDraftStore } from "@/domain/stores";
import { CheckoutRequest } from "@/domain/types";
import { formatDateOnlyLong, formatPrice, formatWallTime, isApiError } from "@/shared/utils";
import { AtButton, AtSkeleton, MlFormAlert, OrOrderSummary } from "@/ui/atomic";

import { lineaDireccion } from "../../_data/direcciones";
import { conteoPedido, filasResumenCarrito, lineasResumen } from "../../_data/resumen-pedido";
import { RUTA_CARRITO, RUTA_CHECKOUT, RUTA_ORDENAR, rutaPedidoConfirmado } from "../../_navegacion";
import { ErrorCheckout, errorCheckout } from "../_data/errores-checkout";

import { usePropietarioBorrador } from "./borrador";
import { CLASE_AYUDA_BLOQUE, CLASE_TITULO_BLOQUE } from "./campos";
import { CabeceraCheckout, EsqueletoCheckout, EstadoCheckout, RejillaCheckout } from "./marco-checkout";
import { useCarritoCheckout } from "./use-carrito-checkout";

const NO_DISPONIBLES_ID = "checkout-no-disponibles";

const CLASE_ENLACE =
  "rounded-sm text-xs font-semibold text-secondary-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Filas etiqueta / valor de la revisión (Figma "Datos de facturación"). */
function Filas({ filas }: { filas: { label: string; value: string | null | undefined }[] }) {
  return (
    <dl className="flex flex-col gap-2.5 text-[13px] leading-5">
      {filas
        .filter((fila) => fila.value)
        .map((fila) => (
          <div key={fila.label} className="grid gap-0.5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-6">
            <dt className="text-muted">{fila.label}</dt>
            <dd className="font-semibold text-foreground sm:text-right">{fila.value}</dd>
          </div>
        ))}
    </dl>
  );
}

/** Datos de facturación de la empresa (`GET /companies/:id`), solo informativos: no bloquean la confirmación. */
function Facturacion() {
  const companyQuery = useActiveCompany();
  const company = companyQuery.data;

  let contenido;
  if (companyQuery.isPending) {
    contenido = (
      <div role="status" aria-label="Cargando los datos de facturación" className="flex flex-col gap-2.5">
        <AtSkeleton className="h-4 w-2/3 rounded-full" />
        <AtSkeleton className="h-4 w-1/2 rounded-full" />
        <AtSkeleton className="h-4 w-3/4 rounded-full" />
      </div>
    );
  } else if (!company) {
    const sinPermiso = isApiError(companyQuery.error) && companyQuery.error.statusCode === 403;
    contenido = (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-background px-4 py-3">
        <p className="text-[13px] leading-5 text-foreground">
          {sinPermiso
            ? "Tu usuario no puede ver los datos de facturación de esta empresa. Puedes confirmar igual."
            : "No pudimos cargar los datos de facturación. Puedes confirmar igual."}
        </p>
        {!sinPermiso && (
          <AtButton
            size="sm"
            variant="bordered"
            color="default"
            className="border-1 border-border-input text-foreground"
            onPress={() => void companyQuery.refetch()}
            isLoading={companyQuery.isFetching}
          >
            Reintentar
          </AtButton>
        )}
      </div>
    );
  } else {
    contenido = (
      <Filas
        filas={[
          // `fiscalName` es la razón social legal; si no está, la del registro (`legalName`).
          { label: "Razón social", value: company.fiscalName || company.legalName },
          { label: "RIF", value: company.taxId },
          { label: "Dirección fiscal", value: company.fiscalAddress ?? "Sin dirección fiscal registrada" },
        ]}
      />
    );
  }

  return (
    <section aria-labelledby="checkout-facturacion-titulo" className="flex flex-col gap-5 rounded-card bg-content1 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h3 id="checkout-facturacion-titulo" className={CLASE_TITULO_BLOQUE}>
          Datos de facturación
        </h3>
        <p className={CLASE_AYUDA_BLOQUE}>Tomados del registro de tu empresa.</p>
      </div>
      {contenido}
    </section>
  );
}

/**
 * Paso 2 del checkout, "Revisión" (fase 1: sustituye a "¿Cómo pagas?" del Figma 3465:2846). Resumen de la entrega
 * con "Editar", datos de facturación de la empresa y el aviso de pago; "Confirmar pedido" llama una sola vez a
 * `POST /orders/checkout` aunque se pulse dos veces. Sin el paso 1 completo vuelve a `/checkout`.
 */
export function CheckoutRevision() {
  const router = useRouter();
  const propietario = usePropietarioBorrador();
  const draft = useCheckoutDraftStore((state) =>
    state.isDraftReady && state.owner === propietario ? state.draft : null,
  );
  const checkout = useCheckout();
  const buscarPedido = useFindCheckoutOrder();
  // Desde que se pulsa hasta que se navega: el carrito se vacía al confirmar y no debe mandar a `/carrito`.
  const [confirmando, setConfirmando] = useState(false);
  // Fallo incierto (red, 408, 5xx): el pedido pudo crearse y vaciar el carrito; tampoco se manda a `/carrito`.
  const [incierto, setIncierto] = useState(false);
  const enviando = useRef(false);
  const { estado, cart, lines, summary, cartQuery } = useCarritoCheckout({
    mantener: confirmando || incierto,
  });
  const addressesQuery = useCompanyAddresses();
  const [error, setError] = useState<ErrorCheckout | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!draft && !confirmando) router.replace(RUTA_CHECKOUT);
  }, [draft, confirmando, router]);

  // El aviso recibe el foco al aparecer (también si el panel de fallo incierto sustituye a la revisión).
  const panelIncierto = incierto && estado === "vacio";
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error, panelIncierto]);

  const cabecera = <CabeceraCheckout paso={2} nombrePaso="Revisión" />;

  if (!draft) {
    return (
      <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
        {cabecera}
        <EsqueletoCheckout />
      </div>
    );
  }

  // Fallo incierto y el carrito ya llega vacío: el pedido seguramente se creó, pero no apareció en `GET /orders`.
  if (panelIncierto && error) {
    return (
      <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
        {cabecera}
        <div ref={errorRef} tabIndex={-1} className="flex flex-col gap-4 rounded-card bg-content1 p-6 outline-none">
          <MlFormAlert title={error.title}>
            {error.detail} Tu carrito ya está vacío: es probable que el pedido se haya creado.
          </MlFormAlert>
          <div className="flex flex-wrap gap-2.5">
            <AtButton as={Link} href={RUTA_ORDENAR} size="md" className="h-[41px] px-6">
              Volver a Ordenar
            </AtButton>
            <AtButton
              as={Link}
              href={RUTA_CARRITO}
              size="md"
              variant="bordered"
              color="default"
              className="h-[41px] border-1 border-border-input px-6 text-foreground"
            >
              Ir al carrito
            </AtButton>
          </div>
        </div>
      </div>
    );
  }

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

  const sede = addressesQuery.data?.find((address) => address.id === draft.deliveryAddressId) ?? null;
  const hayNoDisponibles = lines.some((line) => !line.isAvailable);

  const confirmar = () => {
    if (enviando.current) return;
    enviando.current = true;
    setConfirmando(true);
    setError(null);
    const body: CheckoutRequest = {
      deliveryAddressId: draft.deliveryAddressId,
      deliveryDate: draft.deliveryDate,
      deliveryTime: draft.deliveryTime,
      receiverName: draft.receiverName.trim(),
      receiverPhone: draft.receiverPhone.trim(),
      // El total que se ve en el resumen: si el servidor calcula otro (precios cambiados), responde 409.
      expectedTotal: summary.total,
    };
    const opcionales = {
      addressDetail: draft.addressDetail.trim(),
      addressReference: draft.addressReference.trim(),
      notes: draft.notes.trim(),
    };
    for (const [campo, valor] of Object.entries(opcionales) as [keyof typeof opcionales, string][]) {
      if (valor) body[campo] = valor;
    }
    // Lo que "Pedido confirmado" pinta y la respuesta no trae (nombres y fotos de las líneas, nombre de la sede).
    const lineas = lines.map((line) => ({
      id: line.id,
      name: line.name,
      imageSrc: line.imageSrc,
      quantity: line.quantity,
      subtotal: line.subtotal,
    }));

    const irAConfirmado = (orderId: string) => {
      useCheckoutDraftStore.getState().confirm({
        orderId,
        lines: lineas,
        addressLabel: sede?.label ?? null,
        taxRate: summary.taxRate,
      });
      router.replace(rutaPedidoConfirmado(orderId));
    };

    // El carrito se vuelve a pedir siempre al terminar (`onSettled` de las escrituras del carrito).
    checkout
      .mutateAsync(body)
      .then((order) => irAConfirmado(order.id))
      .catch(async (err: unknown) => {
        const mapeado = errorCheckout(err);
        if (mapeado.incierto) {
          // El pedido pudo crearse: no se redirige ni se deja reintentar hasta buscarlo en `GET /orders`.
          setIncierto(true);
          setError(mapeado);
          const pedido = await buscarPedido(body);
          if (pedido) {
            irAConfirmado(pedido.id);
            return;
          }
        } else {
          setIncierto(false);
          setError(mapeado);
        }
        enviando.current = false;
        setConfirmando(false);
        // Un 404 de dirección: la agenda cambió. Se vuelve a pedir para el paso 1.
        if (isApiError(err) && err.statusCode === 404) void addressesQuery.refetch();
      });
  };

  const fechaHora = `${formatDateOnlyLong(draft.deliveryDate)} · ${formatWallTime(draft.deliveryTime)}`;
  const direccion = sede
    ? [sede.label, draft.addressDetail.trim()].filter(Boolean).join(" · ")
    : draft.addressDetail.trim() || "Sede elegida";

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
      {cabecera}
      <RejillaCheckout>
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="checkout-entrega-titulo" className="flex flex-col gap-5 rounded-card bg-content1 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 id="checkout-entrega-titulo" className={CLASE_TITULO_BLOQUE}>
                  Entrega
                </h3>
                <p className={CLASE_AYUDA_BLOQUE}>Revisa que todo esté bien antes de confirmar.</p>
              </div>
              <Link href={RUTA_CHECKOUT} aria-label="Editar la entrega" className={`${CLASE_ENLACE} mt-1.5 shrink-0`}>
                Editar
              </Link>
            </div>
            <Filas
              filas={[
                { label: "Fecha y hora", value: fechaHora },
                { label: "Dirección", value: direccion },
                { label: "Ubicación", value: sede ? lineaDireccion(sede) : null },
                { label: "Punto de referencia", value: draft.addressReference.trim() },
                { label: "Recibe", value: `${draft.receiverName.trim()} · ${draft.receiverPhone.trim()}` },
                { label: "Notas", value: draft.notes.trim() },
              ]}
            />
          </section>

          <Facturacion />

          <section
            aria-labelledby="checkout-pago-titulo"
            className="flex items-start gap-3 rounded-card bg-surface-sand/60 p-5 sm:p-6"
          >
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="flex flex-col gap-1">
              <h3 id="checkout-pago-titulo" className="text-sm font-semibold leading-5 text-foreground">
                El método de pago lo coordina Ofibites
              </h3>
              <p className="text-[13px] leading-5 text-foreground">
                Al confirmar registramos tu pedido. No tienes que pagar nada en la plataforma.
              </p>
            </div>
          </section>
        </div>

        <OrOrderSummary
          titleId="checkout-resumen"
          countLabel={conteoPedido(lines.length, cart.totalUnits)}
          lines={lineasResumen(lines)}
          rows={filasResumenCarrito(summary)}
          totalLabel={formatPrice(summary.total)}
          className="lg:sticky lg:top-0"
        >
          {error && (
            <div ref={errorRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
              <MlFormAlert title={error.title}>
                {error.detail}
                {error.items && (
                  <span className="mt-1.5 flex flex-col gap-0.5">
                    {error.items.map((item) => (
                      <span key={item.cartItemId} className="block font-normal">
                        {item.name}: {item.reason.toLowerCase()}
                      </span>
                    ))}
                  </span>
                )}
              </MlFormAlert>
              {error.accion === "carrito" && (
                <Link href={RUTA_CARRITO} className={`${CLASE_ENLACE} self-start text-[13px]`}>
                  Revisar el carrito
                </Link>
              )}
              {error.accion === "entrega" && (
                <Link href={RUTA_CHECKOUT} className={`${CLASE_ENLACE} self-start text-[13px]`}>
                  Cambiar la entrega
                </Link>
              )}
            </div>
          )}
          {hayNoDisponibles && !error && (
            <MlFormAlert id={NO_DISPONIBLES_ID} title="Hay productos que ya no están disponibles.">
              Quítalos o cámbialos en el carrito antes de confirmar.
            </MlFormAlert>
          )}
          <AtButton
            size="lg"
            className={`h-[52px] w-full text-sm${hayNoDisponibles ? " cursor-not-allowed opacity-60" : ""}`}
            aria-disabled={hayNoDisponibles || undefined}
            aria-describedby={hayNoDisponibles ? NO_DISPONIBLES_ID : undefined}
            onPress={hayNoDisponibles ? () => undefined : confirmar}
            isLoading={checkout.isPending || confirmando}
          >
            Confirmar pedido
          </AtButton>
          <Link
            href={RUTA_CHECKOUT}
            className="inline-flex items-center justify-center gap-1 self-center rounded-sm text-[13px] font-medium text-ghost-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Volver a entrega
          </Link>
          <p className="flex gap-2 text-[11px] leading-4 text-muted before:mt-1.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-brand before:content-['']">
            Al confirmar creamos el pedido y vaciamos el carrito de tu empresa.
          </p>
        </OrOrderSummary>
      </RejillaCheckout>
    </div>
  );
}
