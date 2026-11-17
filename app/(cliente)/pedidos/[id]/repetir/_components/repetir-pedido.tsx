"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@heroui/react";
import { ChevronLeft, CloudOff, Plus, ShoppingBasket, X } from "lucide-react";

import { useRepeatOrderEdited, useRepeatPreview } from "@/domain/hooks/cart";
import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { EscenarioQaRepetir } from "@/domain/hooks/orders/pedido-qa";
import { EMPTY_CHECKOUT_DRAFT, firstDeliveryDate } from "@/domain/models";
import { useAuthStore, useCheckoutDraftStore } from "@/domain/stores";
import { RepeatOrderItemInput, RepeatPreviewLine, RepeatPreviewOrder, RepeatPreviewResponse } from "@/domain/types";
import { formatPrice, getApiErrorMessage, isApiError } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  AtStatusChip,
  MlEmptyState,
  MlQuantityStepper,
  MlStatusNote,
  OrOrderSummary,
} from "@/ui/atomic";

import { filasResumen } from "../../../../_data/resumen-pedido";
import { RUTA_CARRITO, RUTA_CHECKOUT, RUTA_ORDENAR, RUTA_PEDIDOS, rutaPedido } from "../../../../_navegacion";
import { usePropietarioBorrador } from "../../../../checkout/_components/borrador";
import { cajasTexto, pistaCajas, subtituloLinea, tituloLinea } from "../../../_data/lineas-pedido";
import { diaMes, diaMesPura, fechaPura } from "../../../_data/textos-pago";
import { cajasParaComensales, comensalesDeCajas, MAX_CANTIDAD_LINEA } from "../_data/ajuste-comensales";

import { AgregadoAlCarrito, FilaAgregado } from "./agregado-al-carrito";

/** Espera tras el último cambio antes de pedir el resumen al servidor. */
const DEBOUNCE_MS = 400;
const CLASE_TITULO_BLOQUE = "font-display text-xl font-bold leading-7 text-foreground";
// Columnas de las filas desde `sm` (Figma 3730:3130): producto, precio, stepper, total y quitar.
const COLUMNAS = "sm:grid-cols-[minmax(0,1fr)_96px_120px_96px_28px]";

/** Lo que el usuario edita: cantidad por línea del pedido, líneas quitadas con ✕ y comensales del stepper. */
interface Edicion {
  cantidades: Record<string, number>;
  quitadas: string[];
  comensales: number | null;
  /** Ya cambió algo: el resumen sale de la vista previa con su body, no de la inicial. */
  tocado: boolean;
}

function edicionInicial(vista: RepeatPreviewResponse): Edicion {
  return {
    // El body admite como mucho 999 por línea: un pedido viejo con más no debe fallar al repetirse tal cual.
    cantidades: Object.fromEntries(
      vista.lines.map((line) => [line.orderItemId, Math.min(MAX_CANTIDAD_LINEA, line.orderQuantity)]),
    ),
    quitadas: [],
    comensales: vista.diners,
    tocado: false,
  };
}

/** Valor que solo cambia cuando deja de cambiar durante `ms`. */
function useDebounced<T>(valor: T, ms: number): T {
  const [estable, setEstable] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setEstable(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return estable;
}

/** "26/09" del pedido original: su fecha de entrega o, si no tiene, la de creación. */
function fechaOriginal(order: RepeatPreviewOrder): string {
  return fechaPura(order.deliveryDate) !== "—" ? diaMesPura(order.deliveryDate) : diaMes(order.createdAt);
}

/** `code` de negocio del cuerpo de un error (`REPEAT_ITEM_DUPLICATED`, `REPEAT_ITEM_NOT_IN_ORDER`…), si lo trae. */
function codigoError(err: unknown): string | null {
  if (!isApiError(err) || typeof err.body !== "object" || err.body === null) return null;
  const code = (err.body as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

/** 400 sin `code` ni errores de validación: ninguna de las líneas elegidas sigue disponible. */
function esFaltaDeDisponibilidad(err: unknown): boolean {
  return isApiError(err) && err.statusCode === 400 && !codigoError(err) && !Array.isArray(err.message);
}

/** Error de "Agregar al carrito" en español: los 400 con `code` o de validación, con el texto del back. */
function mensajeErrorAgregar(err: unknown): string {
  if (esFaltaDeDisponibilidad(err)) {
    return "Algunos productos dejaron de estar disponibles. Revisa la lista actualizada e inténtalo de nuevo.";
  }
  if (isApiError(err) && err.statusCode === 400) {
    return getApiErrorMessage(err, "No pudimos agregar el pedido al carrito. Revisa las cantidades.");
  }
  if (isApiError(err) && err.statusCode === 403) return "No tienes acceso para repetir este pedido en tu carrito.";
  return "No pudimos agregar el pedido al carrito. Inténtalo de nuevo.";
}

function Esqueleto() {
  return (
    <div role="status" aria-label="Cargando el pedido a repetir" className="flex flex-col gap-5">
      <AtSkeleton className="h-[72px] w-full max-w-[520px] rounded-card" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <AtSkeleton className="h-[460px] rounded-card" />
        <AtSkeleton className="h-[320px] rounded-card" />
      </div>
    </div>
  );
}

interface FilaLineaProps {
  line: RepeatPreviewLine;
  todas: RepeatPreviewLine[];
  cantidad: number;
  quitada: boolean;
  esCaja: boolean;
  onCantidad: (valor: number) => void;
  onQuitar: () => void;
  onRestaurar: () => void;
  /** Ya se agregó al carrito: sin edición (se ajusta en el carrito). */
  bloqueada: boolean;
}

function FilaLinea(props: FilaLineaProps) {
  const { line, todas, cantidad, quitada, esCaja, onCantidad, onQuitar, onRestaurar, bloqueada } = props;
  const titulo = tituloLinea(line, todas);
  const subtitulo = line.isAvailable ? subtituloLinea(line) : line.unavailableReason;
  const precio = line.currentUnitPrice;
  const total = line.isAvailable && !quitada && precio !== null ? precio * cantidad : null;
  const inactiva = quitada || !line.isAvailable;
  const subio = precio !== null && precio > line.orderUnitPrice;

  return (
    <li
      data-linea={line.orderItemId}
      className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3", COLUMNAS)}
    >
      <div className="col-span-2 min-w-0 sm:col-span-1">
        <p className={cn("text-[13px] font-semibold leading-5", inactiva ? "text-muted line-through decoration-1" : "text-foreground")}>
          {titulo}
        </p>
        {subtitulo && (
          <p
            title={subtitulo}
            className={cn("truncate text-xs leading-[18px]", line.isAvailable ? "text-muted" : "text-danger-700")}
          >
            {subtitulo}
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-1 sm:items-end">
        <span className="text-[13px] tabular-nums text-ghost-foreground">
          <span className="sr-only">Precio: </span>
          {precio !== null ? formatPrice(precio) : "—"}
        </span>
        {line.isAvailable && line.priceChanged && (
          <AtStatusChip tone={subio ? "warning" : "success"}>
            {subio ? "subió" : "bajó"} de {formatPrice(line.orderUnitPrice)}
          </AtStatusChip>
        )}
      </div>

      <div className="flex justify-end sm:justify-center">
        {!line.isAvailable ? (
          <AtStatusChip tone="inactive">No disponible</AtStatusChip>
        ) : quitada && bloqueada ? (
          <span className="text-xs text-muted">Quitado</span>
        ) : quitada ? (
          <AtButton
            data-restaurar={line.orderItemId}
            size="sm"
            variant="bordered"
            className="h-[37px] w-[120px] border-1 border-primary text-xs text-primary"
            onPress={onRestaurar}
            aria-label={`Volver a agregar ${titulo}`}
          >
            Volver a agregar
          </AtButton>
        ) : (
          <MlQuantityStepper
            value={cantidad}
            onChange={onCantidad}
            min={1}
            max={MAX_CANTIDAD_LINEA}
            label={`${esCaja ? "cajas" : "unidades"} de ${titulo}`}
            isDisabled={bloqueada}
            className="w-[120px]"
          />
        )}
      </div>

      <span className="text-right text-[13px] font-semibold tabular-nums text-foreground">
        <span className="sr-only">Total: </span>
        {total !== null ? formatPrice(total) : "—"}
      </span>

      <span className="flex justify-end">
        {line.isAvailable && !quitada && !bloqueada && (
          <button
            type="button"
            data-quitar={line.orderItemId}
            onClick={onQuitar}
            aria-label={`Quitar ${titulo}`}
            className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </span>
    </li>
  );
}

interface GrupoLineasProps {
  grupo: string;
  pista?: string | null;
  columnaCantidad: string;
  lineas: RepeatPreviewLine[];
  children: (line: RepeatPreviewLine) => ReactNode;
}

function GrupoLineas({ grupo, pista, columnaCantidad, lineas, children }: GrupoLineasProps) {
  if (lineas.length === 0) return null;
  const id = `repetir-grupo-${grupo.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col">
      <p id={id} className="flex flex-wrap items-baseline gap-x-2.5 text-[10px] leading-4">
        <span className="font-semibold uppercase text-brand">{grupo}</span>
        {pista && <span className="text-[11px] text-muted">{pista}</span>}
      </p>
      <div
        aria-hidden="true"
        className={cn("mt-3 hidden gap-x-4 text-[10px] font-semibold text-foreground sm:grid", COLUMNAS)}
      >
        <span>PRODUCTO</span>
        <span className="text-right">PRECIO</span>
        <span className="text-center">{columnaCantidad}</span>
        <span className="text-right">TOTAL</span>
        <span />
      </div>
      <ul aria-labelledby={id} className="flex flex-col divide-y divide-track">
        {lineas.map(children)}
      </ul>
    </div>
  );
}

interface RepetirPedidoProps {
  orderId: string;
  /** Datos de ejemplo (`?qa=`, solo desarrollo). */
  qa?: EscenarioQaRepetir;
}

/**
 * Editor "Repetir pedido" (Figma 3730:3130 y 3731:3396, T-38d), que sustituye al modal de confirmación. Parte de
 * `POST /cart/repeat/:orderId/preview` (precios de hoy y disponibilidad); el usuario ajusta comensales (solo mueven
 * las cajas), cantidades y líneas, y el resumen se recalcula en el servidor con debounce. "Agregar al carrito" envía
 * las líneas y cantidades elegidas a `POST /cart/repeat/:orderId` y siembra el borrador del checkout con la sede y el
 * contacto del pedido original (fecha y hora se eligen en el checkout). Sin "Cuándo y dónde" (decisión del usuario).
 */
export function RepetirPedido({ orderId, qa }: RepetirPedidoProps) {
  const router = useRouter();
  const inicial = useRepeatPreview(orderId, null, { qa });
  const vistaInicial = inicial.data;
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  // Se fija la primera vez que llegan los datos (si se derivara siempre, un refetch borraría lo editado).
  if (!edicion && vistaInicial) setEdicion(edicionInicial(vistaInicial));

  const lines = useMemo(() => vistaInicial?.lines ?? [], [vistaInicial]);
  const quitadas = useMemo(() => new Set(edicion?.quitadas ?? []), [edicion]);
  const elegidas = useMemo(
    () => lines.filter((line) => line.isAvailable && !quitadas.has(line.orderItemId)),
    [lines, quitadas],
  );
  const items = useMemo<RepeatOrderItemInput[]>(
    () =>
      elegidas.map((line) => ({
        orderItemId: line.orderItemId,
        quantity: edicion?.cantidades[line.orderItemId] ?? line.orderQuantity,
      })),
    [elegidas, edicion],
  );
  const itemsEstables = useDebounced(items, DEBOUNCE_MS);
  const tocado = edicion?.tocado ?? false;
  const editada = useRepeatPreview(orderId, itemsEstables, {
    qa,
    enabled: tocado && itemsEstables.length > 0,
  });

  const addressesQuery = useCompanyAddresses();
  const user = useAuthStore((state) => state.user);
  const propietario = usePropietarioBorrador();
  const repetir = useRepeatOrderEdited({ qa });
  const [agregado, setAgregado] = useState<{ filas: FilaAgregado[]; aviso: string | null } | null>(null);
  const [hecho, setHecho] = useState(false);
  const [errorAgregar, setErrorAgregar] = useState<string | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  // Guarda síncrona contra el doble clic: el segundo llega antes de que `isPending` se pinte.
  const enviando = useRef(false);
  // Última vista previa editada que respondió bien. En React Query v5, si la siguiente falla, `editada.data` queda
  // `undefined`: sin esto, el resumen volvería al del pedido original como si fuera vigente. Es estado (actualizado en
  // render) y no un ref porque se lee al pintar (react-hooks/refs).
  const [ultimaEditada, setUltimaEditada] = useState<RepeatPreviewResponse | null>(null);
  if (editada.data && editada.data !== ultimaEditada) setUltimaEditada(editada.data);

  if (!vistaInicial || !edicion) {
    if (inicial.isError) {
      const status = isApiError(inicial.error) ? inicial.error.statusCode : null;
      const noEsta = status === 404 || status === 400 || status === 403;
      return (
        <div className="mx-auto w-full max-w-[1296px] rounded-card bg-content1">
          <MlEmptyState
            tone={noEsta ? "neutral" : "error"}
            headingLevel={2}
            icon={noEsta ? undefined : <CloudOff />}
            title={
              status === 403
                ? "No tienes acceso a este pedido"
                : noEsta
                  ? "No encontramos este pedido"
                  : "No pudimos preparar el pedido a repetir"
            }
            description={
              noEsta
                ? "Puede ser de otra empresa o haberse borrado."
                : "Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
            }
            actionLabel={noEsta ? "Volver a pedidos" : "Reintentar"}
            actionHref={noEsta ? RUTA_PEDIDOS : undefined}
            onAction={noEsta ? undefined : () => void inicial.refetch()}
            isActionLoading={inicial.isFetching}
          />
        </div>
      );
    }
    return (
      <div className="mx-auto w-full max-w-[1296px]">
        <Esqueleto />
      </div>
    );
  }

  const order = vistaInicial.order;
  const numero = order.orderNumber ?? order.id.slice(-8).toUpperCase();
  const fecha = fechaOriginal(order);
  const volver = (
    <Link
      href={rutaPedido(orderId)}
      className="inline-flex items-center gap-1 self-start rounded-sm text-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      Volver al pedido #{numero}
    </Link>
  );

  // Nada que repetir: sin líneas o ninguna sigue disponible.
  if (!lines.some((line) => line.isAvailable)) {
    const motivos = lines.map((line) => `${line.name} (${(line.unavailableReason ?? "no disponible").toLowerCase()})`);
    return (
      <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
        {volver}
        <div className="rounded-card bg-content1">
          <MlEmptyState
            headingLevel={2}
            illustrationSrc="/images/empty/tomate.png"
            titleTone="brand"
            title="Ningún producto de este pedido sigue disponible"
            description={
              motivos.length
                ? `No podemos repetirlo tal cual: ${motivos.join(", ")}. Explora el catálogo para armar uno nuevo.`
                : "Este pedido no tiene productos para repetir. Explora el catálogo para armar uno nuevo."
            }
            actionLabel="Explorar el catálogo"
            actionHref={RUTA_ORDENAR}
          />
        </div>
      </div>
    );
  }

  const cajasDisponibles = lines.filter((line) => line.kind === "box" && line.isAvailable);
  const cajasElegidas = elegidas.filter((line) => line.kind === "box");
  const cantidadDe = (line: RepeatPreviewLine) =>
    edicion.cantidades[line.orderItemId] ?? line.orderQuantity;
  const totalCajas = cajasElegidas.reduce((total, line) => total + cantidadDe(line), 0);
  const comensales = edicion.comensales ?? 0;
  const pista = pistaCajas(cajasDisponibles.map((line) => line.servings));
  const noDisponibles = lines.filter((line) => !line.isAvailable);

  const editar = (cambio: (actual: Edicion) => Edicion) =>
    setEdicion((actual) => (actual ? { ...cambio(actual), tocado: true } : actual));

  // Comensales de las cajas elegidas con sus cantidades (al tocar una caja a mano, el stepper la sigue).
  const comensalesCon = (cantidades: Record<string, number>, sinQuitar: Set<string>) =>
    comensalesDeCajas(
      cajasDisponibles
        .filter((line) => !sinQuitar.has(line.orderItemId))
        .map((line) => ({
          servings: line.servings ?? 1,
          quantity: cantidades[line.orderItemId] ?? line.orderQuantity,
        })),
    );

  const cambiarComensales = (valor: number) =>
    editar((actual) => {
      const quitadasActuales = new Set(actual.quitadas);
      const cajas = cajasDisponibles
        .filter((line) => !quitadasActuales.has(line.orderItemId))
        .map((line) => ({
          orderItemId: line.orderItemId,
          servings: line.servings ?? 1,
          orderQuantity: line.orderQuantity,
        }));
      const cantidades = { ...actual.cantidades, ...cajasParaComensales(cajas, valor) };
      return { ...actual, comensales: valor, cantidades };
    });

  const cambiarCantidad = (line: RepeatPreviewLine, valor: number) =>
    editar((actual) => {
      const cantidades = { ...actual.cantidades, [line.orderItemId]: valor };
      const comensalesNuevos =
        line.kind === "box" ? comensalesCon(cantidades, new Set(actual.quitadas)) : actual.comensales;
      return { ...actual, cantidades, comensales: comensalesNuevos };
    });

  const enfocar = (selector: string) =>
    requestAnimationFrame(() => listaRef.current?.querySelector<HTMLElement>(selector)?.focus());

  const quitar = (line: RepeatPreviewLine) => {
    editar((actual) => {
      const quitadasNuevas = [...actual.quitadas, line.orderItemId];
      const comensalesNuevos =
        line.kind === "box" ? comensalesCon(actual.cantidades, new Set(quitadasNuevas)) : actual.comensales;
      return { ...actual, quitadas: quitadasNuevas, comensales: comensalesNuevos };
    });
    enfocar(`[data-restaurar="${line.orderItemId}"]`);
  };

  const restaurar = (line: RepeatPreviewLine) => {
    editar((actual) => {
      const quitadasNuevas = actual.quitadas.filter((id) => id !== line.orderItemId);
      const comensalesNuevos =
        line.kind === "box" ? comensalesCon(actual.cantidades, new Set(quitadasNuevas)) : actual.comensales;
      return { ...actual, quitadas: quitadasNuevas, comensales: comensalesNuevos };
    });
    enfocar(`[data-quitar="${line.orderItemId}"]`);
  };

  // Resumen: el de la vista previa con lo editado (la anterior mientras llega la nueva) o, sin cambios, la inicial.
  // Si la última falló, la anterior correcta solo como referencia atenuada y sin total vigente.
  const vista = tocado ? (editada.data ?? ultimaEditada ?? vistaInicial) : vistaInicial;
  const sinLineas = items.length === 0;
  const pendiente = tocado && !sinLineas && (items !== itemsEstables || editada.isFetching);
  const resumenCaido = tocado && !sinLineas && editada.isError && !editada.isFetching;
  const summary = vista.summary;
  const precioCambio = vista.priceChangedCount;
  // Mientras el resumen se recalcula, "Agregar" espera: el total del modal sería el de las cantidades anteriores.
  const bloqueado = sinLineas || pendiente;

  let nota: { tone: "success" | "warning"; texto: string } | null = null;
  if (!sinLineas && !resumenCaido) {
    if (precioCambio > 0) {
      nota = {
        tone: "warning",
        texto: `${precioCambio === 1 ? "Cambió el precio de 1 producto" : `Cambió el precio de ${precioCambio} productos`} desde el pedido del ${fecha}. El resumen ya usa los precios de hoy.`,
      };
    } else if (order.total !== null && summary.total === order.total) {
      nota = { tone: "success", texto: `Mismo monto que el pedido del ${fecha}. Ningún precio cambió.` };
    } else {
      nota = { tone: "success", texto: `Ningún precio cambió desde el pedido del ${fecha}.` };
    }
  }

  const sembrarCheckout = () => {
    // Con datos de QA no se toca el borrador real del checkout.
    if (qa) return;
    const store = useCheckoutDraftStore.getState();
    const previo = store.owner === propietario ? store.draft : null;
    const base = previo ?? { ...EMPTY_CHECKOUT_DRAFT, deliveryDate: firstDeliveryDate() };
    store.saveDraft(
      propietario,
      {
        ...base,
        deliveryAddressId: order.deliveryAddressId,
        addressDetail: order.addressDetail ?? "",
        addressReference: order.addressReference ?? "",
        receiverName: order.receiverName ?? (base.receiverName || user?.name || ""),
        receiverPhone: order.receiverPhone ?? (base.receiverPhone || user?.phone || ""),
      },
      false,
    );
  };

  const agregar = () => {
    if (bloqueado || hecho || enviando.current) return;
    enviando.current = true;
    setErrorAgregar(null);
    const resumenVisto = resumenCaido ? null : summary;
    repetir
      .mutateAsync({ orderId, items })
      .then(({ skipped }) => {
        sembrarCheckout();
        const sede = addressesQuery.data?.find((address) => address.id === order.deliveryAddressId);
        const filas: FilaAgregado[] = [];
        if (sede) filas.push({ label: "Sede", value: [sede.label, sede.city].filter(Boolean).join(" · ") });
        if (totalCajas > 0) filas.push({ label: "Cajas", value: `${cajasTexto(totalCajas)} para ${comensales} comensales` });
        if (resumenVisto) filas.push({ label: "Total", value: formatPrice(resumenVisto.total) });
        // `enviando` se queda en `true`: repetir otra vez sumaría las cantidades al carrito.
        setHecho(true);
        setAgregado({
          filas,
          aviso: skipped.length
            ? `${skipped.length === 1 ? "No se agregó" : "No se agregaron"}: ${skipped
                .map((linea) => `${linea.name} (${linea.reason.toLowerCase()})`)
                .join(", ")}.`
            : null,
        });
      })
      .catch((err: unknown) => {
        enviando.current = false;
        setErrorAgregar(mensajeErrorAgregar(err));
        // Sin disponibilidad: la lista se vuelve a pedir para marcar lo que ya no está.
        if (esFaltaDeDisponibilidad(err)) void inicial.refetch();
        requestAnimationFrame(() => errorRef.current?.focus());
      });
  };

  const renderLinea = (line: RepeatPreviewLine) => (
    <FilaLinea
      key={line.orderItemId}
      line={line}
      todas={lines}
      cantidad={cantidadDe(line)}
      quitada={quitadas.has(line.orderItemId)}
      esCaja={line.kind === "box"}
      onCantidad={(valor) => cambiarCantidad(line, valor)}
      onQuitar={() => quitar(line)}
      onRestaurar={() => restaurar(line)}
      bloqueada={hecho}
    />
  );

  const cajas = lines.filter((line) => line.kind === "box");
  const complementos = lines.filter((line) => line.kind !== "box");

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
      {volver}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">Repetir pedido</h1>
          <p className="text-sm leading-5 text-brand">
            Revisa las cantidades. Al confirmar se agrega al carrito, no se envía todavía.
          </p>
        </div>
        <p className="rounded-full bg-content1/70 px-3 py-1.5 text-xs text-muted">
          Basado en el pedido #{numero} del {fecha}
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section
          aria-labelledby="repetir-productos-titulo"
          className="flex min-w-0 flex-col gap-5 rounded-card bg-content1 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 id="repetir-productos-titulo" className={CLASE_TITULO_BLOQUE}>
                Cajas y complementos
              </h2>
              <p className="text-xs leading-[18px] text-muted">
                {pista ? `${pista.charAt(0).toUpperCase()}${pista.slice(1)}. ` : ""}
                Ajusta las cantidades si cambió el número de asistentes.
              </p>
            </div>
            {cajasDisponibles.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  Nº de comensales
                </span>
                <MlQuantityStepper
                  value={Math.max(1, comensales)}
                  onChange={cambiarComensales}
                  min={1}
                  max={MAX_CANTIDAD_LINEA}
                  label="comensales"
                  isDisabled={hecho || cajasElegidas.length === 0}
                  className="w-[115px]"
                />
              </div>
            )}
          </div>

          {noDisponibles.length > 0 && (
            <MlStatusNote tone="warning">
              {noDisponibles.length === 1
                ? "1 producto del pedido ya no está disponible y no se agregará."
                : `${noDisponibles.length} productos del pedido ya no están disponibles y no se agregarán.`}
            </MlStatusNote>
          )}

          <div ref={listaRef} className="flex flex-col gap-5">
            {cajas.length > 0 ? (
              <>
                <GrupoLineas grupo="Cajas del pedido" pista={pista} columnaCantidad="CAJAS" lineas={cajas}>
                  {renderLinea}
                </GrupoLineas>
                {complementos.length > 0 && (
                  <div className="border-t border-track pt-4">
                    <GrupoLineas
                      grupo="Complementos"
                      pista="se suman a las cajas"
                      columnaCantidad="UNIDADES"
                      lineas={complementos}
                    >
                      {renderLinea}
                    </GrupoLineas>
                  </div>
                )}
              </>
            ) : (
              <GrupoLineas grupo="Productos" columnaCantidad="CANTIDAD" lineas={complementos}>
                {renderLinea}
              </GrupoLineas>
            )}
          </div>

          {cajasElegidas.length > 0 && (
            <MlStatusNote tone="success">
              <span className="font-semibold">
                {cajasTexto(totalCajas)} para {comensales} comensales
              </span>{" "}
              Si subes los comensales, las cajas se ajustan solas.
            </MlStatusNote>
          )}

          <Link
            href={RUTA_ORDENAR}
            className="inline-flex items-center gap-1.5 self-start rounded-sm text-[13px] font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Plus aria-hidden="true" className="size-4" />
            Agregar otro producto del catálogo
          </Link>
        </section>

        <div aria-busy={pendiente || undefined} className="lg:sticky lg:top-0">
          <OrOrderSummary
            variant="order"
            title="Resumen"
            titleId="repetir-resumen-titulo"
            className={cn(
              "[&_dl]:transition-opacity [&_dl]:duration-(--duration-fast)",
              (pendiente || resumenCaido) && "[&_dl]:opacity-50",
            )}
            rows={
              sinLineas
                ? []
                : filasResumen(
                    {
                      subtotal: summary.subtotal,
                      discount: summary.discount,
                      shipping: summary.shipping,
                      tax: summary.tax,
                      taxRate: summary.taxRate,
                    },
                    "Envío",
                    "Subtotal",
                    true,
                  ).map((fila) => (resumenCaido ? { ...fila, value: "—", isHighlighted: false } : fila))
            }
            totalLabel={sinLineas ? formatPrice(0) : resumenCaido ? "—" : formatPrice(summary.total)}
          >
            {sinLineas ? (
              <MlStatusNote tone="neutral">Quitaste todos los productos. Vuelve a agregar alguno para continuar.</MlStatusNote>
            ) : (
              nota && (
                <MlStatusNote
                  tone={nota.tone}
                  className={cn("transition-opacity duration-(--duration-fast)", pendiente && "opacity-50")}
                >
                  {nota.texto}
                </MlStatusNote>
              )
            )}
            {hecho && (
              <MlStatusNote tone="neutral">Ya está en tu carrito; ajusta allí las cantidades.</MlStatusNote>
            )}
            {tocado && editada.isError && !sinLineas && (
              <p role="status" className="text-xs leading-[18px] text-danger-700">
                No pudimos actualizar el resumen. El carrito recalcula los precios al agregar.{" "}
                <button type="button" className="font-semibold underline" onClick={() => void editada.refetch()}>
                  Reintentar
                </button>
              </p>
            )}
            {errorAgregar && (
              <p
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700 outline-none"
              >
                {errorAgregar}
              </p>
            )}
            {/* Tras agregar, el botón lleva al carrito: pulsarlo otra vez sumaría las cantidades de nuevo. */}
            {hecho ? (
              <AtButton as={Link} href={RUTA_CARRITO} size="lg" className="h-[47px] w-full text-sm">
                Ver el carrito
              </AtButton>
            ) : (
              <AtButton
                size="lg"
                className={cn("h-[47px] w-full text-sm", bloqueado && "cursor-not-allowed opacity-disabled")}
                startContent={<ShoppingBasket aria-hidden="true" className="size-4" />}
                aria-disabled={bloqueado || undefined}
                isLoading={repetir.isPending}
                onPress={agregar}
              >
                Agregar al carrito
              </AtButton>
            )}
            <AtButton
              as={Link}
              href={rutaPedido(orderId)}
              size="lg"
              variant="bordered"
              className="h-[47px] w-full border-1 border-primary bg-content1 text-sm text-primary"
            >
              Cancelar
            </AtButton>
            <p className="text-center text-[11px] leading-4 text-subtle">
              El pedido se confirma en el carrito, junto con el método de pago.
            </p>
          </OrOrderSummary>
        </div>
      </div>

      <AgregadoAlCarrito
        isOpen={agregado !== null}
        onClose={() => setAgregado(null)}
        filas={agregado?.filas ?? []}
        aviso={agregado?.aviso}
        onIrAlCheckout={() => router.push(RUTA_CHECKOUT)}
        onSeguirEnCatalogo={() => router.push(RUTA_ORDENAR)}
      />
    </div>
  );
}
