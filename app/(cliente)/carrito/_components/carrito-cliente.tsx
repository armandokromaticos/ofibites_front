"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ChevronLeft, Truck } from "lucide-react";

import { useCart, useCartLines, useClearCart, useRepeatOrder } from "@/domain/hooks/cart";
import { useCatalog } from "@/domain/hooks/catalog";
import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { firstDeliveryDate } from "@/domain/models";
import { CartLineModel } from "@/domain/models";
import { useAuthStore, useCartNoticeStore } from "@/domain/stores";
import { duration } from "@/shared/motion";
import { formatDateOnlyLong, formatPrice, formatPriceRange, isApiError } from "@/shared/utils";
import { AtButton, AtSkeleton, MlEmptyState, MlProductMiniCard, OrConfirmModal, OrOrderSummary } from "@/ui/atomic";

import { lineaDireccion } from "../../_data/direcciones";
import { mensajeErrorCarrito } from "../../_data/errores-carrito";
import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../_data/imagenes";
import { avisoPedidoRepetido, mensajeErrorRepetir } from "../../_data/repetir-pedido";
import { filasResumenCarrito } from "../../_data/resumen-pedido";
import { RUTA_CHECKOUT, RUTA_ORDENAR, rutaProducto } from "../../_navegacion";

import { EnvioGratis } from "./envio-gratis";
import { LineaCarrito } from "./linea-carrito";

const CHECKOUT_NOTE_ID = "carrito-checkout-nota";
const TITULO_ID = "carrito-titulo";

function unidades(n: number): string {
  return `${n} ${n === 1 ? "unidad" : "unidades"}`;
}

function productos(n: number): string {
  return `${n} ${n === 1 ? "producto" : "productos"}`;
}

/** Cabecera de la página: título de marca, número de productos y vuelta al catálogo. */
function CabeceraCarrito({ lineCount, entrega }: { lineCount?: number; entrega: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex flex-col gap-2.5">
        <h2 id={TITULO_ID} tabIndex={-1} className="font-display text-[28px] font-bold leading-9 tracking-[-0.03em] text-foreground outline-none">
          Tu carrito
        </h2>
        {lineCount !== undefined && lineCount > 0 && (
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-sand px-5 py-1 text-sm leading-5 text-brand">
            <Truck aria-hidden="true" className="size-4" />
            {productos(lineCount)} · entrega estimada para el {entrega}
          </p>
        )}
      </div>
      <Link
        href={RUTA_ORDENAR}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-ghost-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Seguir explorando el catálogo
      </Link>
    </div>
  );
}

/** "Agrega a tu pedido": tres ítems del catálogo (destacados primero) que no estén ya en el carrito. */
function AgregaATuPedido({ lines }: { lines: CartLineModel[] }) {
  const { data } = useCatalog({ pageSize: 8 });
  const enCarrito = new Set(lines.map((line) => `${line.kind}:${line.catalogId}`));
  const items = (data?.items.data ?? []).filter((item) => !enCarrito.has(`${item.kind}:${item.id}`)).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="carrito-agrega" className="flex flex-col gap-5">
      <h2 id="carrito-agrega" className="font-display text-[23px] font-bold leading-8 tracking-[-0.03em] text-foreground">
        Agrega a tu pedido
      </h2>
      <ul className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={`${item.kind}:${item.id}`}>
            <MlProductMiniCard
              name={item.name}
              imageSrc={item.image ?? IMAGEN_PRODUCTO_POR_DEFECTO}
              priceLabel={formatPriceRange(item.priceFrom, item.priceTo)}
              href={rutaProducto(item.id, item.kind)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Carrito vacío (Figma 3390:2397): "Explorar el catálogo" y "Repetir mi último pedido" (`POST /cart/repeat/last`).
 * El botón sale siempre (sin descargar el historial); si no hay pedido que repetir (404), se explica y se oculta.
 */
function CarritoVacio({ onRepetido }: { onRepetido: (aviso: string) => void }) {
  const repeat = useRepeatOrder();
  const [aviso, setAviso] = useState<string | null>(null);
  const [sinPedidos, setSinPedidos] = useState(false);
  const avisoRef = useRef<HTMLParagraphElement>(null);

  // El botón queda inerte mientras carga (y desaparece sin pedidos): el foco pasa al aviso que explica el error.
  useEffect(() => {
    if (aviso) avisoRef.current?.focus();
  }, [aviso]);

  const repetir = () => {
    if (repeat.isPending) return;
    setAviso(null);
    // Promesa y no callbacks de `mutate`: con líneas en el carrito este bloque se desmonta y React Query no
    // llamaría a los callbacks de un observador desmontado.
    repeat
      .mutateAsync("last")
      .then((result) => onRepetido(avisoPedidoRepetido(result)))
      .catch((error: unknown) => {
        if (isApiError(error) && error.statusCode === 404) setSinPedidos(true);
        setAviso(mensajeErrorRepetir(error, true));
      });
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-content1 px-6 py-16 text-center sm:py-20">
      <Image src="/images/decor/flat-2.png" alt="" width={84} height={53} className="mb-2" />
      <h3 className="text-balance font-display text-[28px] font-bold leading-9 tracking-[-0.03em] text-brand">
        Tu carrito está vacío
      </h3>
      <p className="max-w-[46ch] text-pretty text-[13px] leading-5 text-muted">
        Arma el próximo coffee break de tu equipo en menos de dos minutos
        {sinPedidos ? "." : ", o repite el último pedido tal cual lo hiciste."}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <AtButton as={Link} href={RUTA_ORDENAR} size="md" className="h-[41px] px-6">
          Explorar el catálogo
        </AtButton>
        {!sinPedidos && (
          <AtButton
            size="md"
            variant="bordered"
            color="default"
            className="h-[41px] border-1 border-border-input px-6 text-foreground"
            onPress={repetir}
            isLoading={repeat.isPending}
          >
            Repetir mi último pedido
          </AtButton>
        )}
      </div>
      {aviso && (
        <p
          ref={avisoRef}
          tabIndex={-1}
          role="status"
          className="mt-2 max-w-[46ch] text-[13px] leading-5 text-foreground outline-none"
        >
          {aviso}
        </p>
      )}
    </div>
  );
}

function CarritoEsqueleto() {
  return (
    <div role="status" aria-label="Cargando tu carrito" className="grid gap-[29px] lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_382px]">
      <div className="flex flex-col gap-0 rounded-card bg-content1 px-6">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex gap-6 border-b border-divider py-5 last:border-0">
            <AtSkeleton className="size-[88px] shrink-0" />
            <div className="flex flex-1 flex-col gap-2.5 pt-1">
              <AtSkeleton className="h-5 w-2/5 rounded-full" />
              <AtSkeleton className="h-3.5 w-1/3 rounded-full" />
              <AtSkeleton className="h-3 w-1/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <AtSkeleton className="h-[260px] rounded-card" />
    </div>
  );
}

/**
 * Página del carrito: líneas con cantidad y "Eliminar", "Vaciar" con confirmación, resumen del servidor (subtotal,
 * envío, IVA y total de `summary`, T-26a), "Continuar al checkout" y "Agrega a tu pedido".
 */
export function CarritoCliente() {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const cartQuery = useCart();
  const lines = useCartLines(cartQuery.data);
  const clear = useClearCart();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Aviso que deja otra pantalla al traer aquí un pedido repetido (dashboard): se lee al montar (antes de los
  // efectos, así StrictMode no lo pierde) y se borra del store, para que no reaparezca al volver.
  const [aviso, setAviso] = useState<string | null>(() => useCartNoticeStore.getState().notice);
  useEffect(() => {
    useCartNoticeStore.getState().setNotice(null);
  }, []);
  // Un aviso que llega (del dashboard al montar, o tras repetir aquí) recibe el foco: explica qué cambió.
  const avisoRef = useRef<HTMLParagraphElement>(null);
  const enfocarAviso = useRef(aviso !== null);
  useEffect(() => {
    if (!aviso || !enfocarAviso.current) return;
    enfocarAviso.current = false;
    avisoRef.current?.focus();
  }, [aviso]);
  const cart = cartQuery.data;
  // Primera fecha que permite el corte de las 15:00 de Caracas (la misma regla que el selector del checkout).
  const [entrega] = useState(() => formatDateOnlyLong(firstDeliveryDate()).toLowerCase());
  // "Sede: …" del resumen: la primera sede de entrega de la agenda; sin sedes o con error, no se pinta.
  const addressesQuery = useCompanyAddresses();
  const sede = addressesQuery.data?.find((address) => address.isShipping) ?? null;
  // El checkout rechaza líneas no disponibles (400): se avisa antes de entrar.
  const hayNoDisponibles = lines.some((line) => !line.isAvailable);

  const isUnavailable =
    !companyId ||
    (cartQuery.isError && isApiError(cartQuery.error) && cartQuery.error.statusCode === 403);

  // El "Eliminar" de la línea quitada desaparece: el foco pasa al de la línea que ocupará su sitio (la siguiente,
  // o la anterior si era la última), que sigue en pantalla; sin otras líneas, al título.
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const enfocarTrasQuitar = (removedId: string, index: number) => {
    const others = lines.filter((line) => line.id !== removedId);
    const next = others[Math.min(index, others.length - 1)];
    (next ? removeButtons.current.get(next.id) : document.getElementById(TITULO_ID))?.focus();
  };

  // Tras vaciar desde el modal, el botón que lo abrió ya no existe: cuando termina la salida del modal (y su
  // devolución del foco), el foco va al título de la página.
  const focusTitleAfterModal = () => {
    setTimeout(() => document.getElementById(TITULO_ID)?.focus(), duration.fast * 1000 + 80);
  };

  const vaciar = () => {
    setError(null);
    clear.mutate(undefined, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        focusTitleAfterModal();
      },
      onError: (err) => {
        setIsConfirmOpen(false);
        setError(mensajeErrorCarrito(err, "vaciar"));
      },
    });
  };

  let contenido;
  if (isUnavailable) {
    contenido = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          title="Sin carrito en esta empresa"
          description="Tu usuario no puede hacer pedidos para la empresa activa. Si crees que es un error, habla con el administrador de tu empresa."
        />
      </div>
    );
  } else if (!cart && cartQuery.isError) {
    contenido = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          title="No pudimos cargar tu carrito"
          description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => void cartQuery.refetch()}
          isActionLoading={cartQuery.isFetching}
        />
      </div>
    );
  } else if (!cart) {
    contenido = <CarritoEsqueleto />;
  } else if (lines.length === 0) {
    contenido = (
      <CarritoVacio
        onRepetido={(mensaje) => {
          setAviso(mensaje);
          // "Repetir" desaparece con el carrito vacío: el foco pasa al aviso de lo que se añadió.
          enfocarAviso.current = true;
        }}
      />
    );
  } else {
    contenido = (
      <div className="grid items-start gap-[29px] lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_382px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-label="Productos del carrito" className="rounded-card bg-content1 px-5 sm:px-7">
            <ul className="divide-y divide-divider">
              {lines.map((line, index) => (
                <li key={line.id}>
                  <LineaCarrito
                    line={line}
                    onError={(mensaje) => {
                      setError(mensaje);
                      setAviso(null);
                    }}
                    onStale={() => void cartQuery.refetch()}
                    onRemoved={() => enfocarTrasQuitar(line.id, index)}
                    removeButtonRef={(element) => {
                      if (element) removeButtons.current.set(line.id, element);
                      else removeButtons.current.delete(line.id);
                    }}
                  />
                </li>
              ))}
            </ul>
            <div className="flex justify-end border-t border-divider py-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="rounded-sm text-[13px] font-medium text-secondary-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Vaciar carrito
              </button>
            </div>
          </section>
          <AgregaATuPedido lines={lines} />
        </div>

        <OrOrderSummary
          titleId="carrito-resumen"
          subtitle={sede ? `Sede: ${lineaDireccion(sede)}` : undefined}
          rows={filasResumenCarrito(cart.summary, `Subtotal (${unidades(cart.totalUnits)})`)}
          totalLabel={formatPrice(cart.summary.total)}
          className="lg:sticky lg:top-0"
        >
          <EnvioGratis summary={cart.summary} />
          {hayNoDisponibles ? (
            <>
              <AtButton
                size="md"
                className="h-[41px] w-full cursor-not-allowed opacity-60"
                aria-disabled="true"
                aria-describedby={CHECKOUT_NOTE_ID}
                onPress={() => undefined}
              >
                Continuar al checkout
              </AtButton>
              <p id={CHECKOUT_NOTE_ID} className="-mt-1 text-center text-xs leading-5 text-danger-700">
                Quita los productos que ya no están disponibles para continuar.
              </p>
            </>
          ) : (
            <AtButton as={Link} href={RUTA_CHECKOUT} size="md" className="h-[41px] w-full">
              Continuar al checkout
            </AtButton>
          )}
        </OrOrderSummary>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
      <CabeceraCarrito lineCount={cart && !isUnavailable ? lines.length : undefined} entrega={entrega} />
      <p className="flex items-center gap-2.5 rounded-control bg-content1 px-4 py-3 text-xs leading-5 text-muted sm:px-5">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
        <span>
          Los pedidos se agendan hasta las{" "}
          <strong className="font-semibold text-secondary-600">3:00 p.m. del día anterior</strong>
        </span>
      </p>
      {aviso && (
        <p
          ref={avisoRef}
          tabIndex={-1}
          role="status"
          className="rounded-control bg-surface-sand px-4 py-3 text-sm leading-5 text-foreground outline-none"
        >
          {aviso}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-control bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700">
          {error}
        </p>
      )}
      {contenido}
      <OrConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={vaciar}
        isConfirming={clear.isPending}
        isDestructive
        title="¿Vaciar el carrito?"
        description="Se quitarán todos los productos del pedido de tu empresa. El carrito es compartido: también deja de verlo el resto de compradores."
        confirmLabel="Vaciar carrito"
      />
    </div>
  );
}
