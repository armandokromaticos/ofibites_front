"use client";

import { MouseEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@heroui/react";
import { ChevronLeft, Plus } from "lucide-react";

import { useAddCartItem } from "@/domain/hooks/cart";
import { AddCartItemRequest, CatalogItemDetail, CatalogServingOption } from "@/domain/types";
import { formatPrice, getApiErrorMessages, isApiError } from "@/shared/utils";
import { AtButton, MlQuantityStepper, MlSegmentedControl, OrBoxDetailsModal } from "@/ui/atomic";

import { marcarVueltaCliente, rutaAnteriorCliente } from "../../../_components/ruta-anterior";
import { RUTA_ORDENAR } from "../../../_navegacion";

import { AvisoCompra, ResultadoCompra } from "./aviso-compra";

const MAX_CANTIDAD = 99;

interface PanelCompraProps {
  item: CatalogItemDetail;
  /** Foto superior del pop-up "Detalles de la caja". */
  imagenCaja: string;
}

/** Tamaño por defecto; si ninguno lo es, el primero (el back exige `productSizeId` si hay tamaños). */
function opcionInicial(opciones: CatalogServingOption[]): string | null {
  return (opciones.find((opcion) => opcion.isDefault) ?? opciones[0])?.sizeId ?? null;
}

/** Texto visible de un tamaño: el número de personas ("8") o, si no lo hay, su nombre. */
function etiquetaOpcion(opcion: CatalogServingOption): string {
  return opcion.servings !== null ? String(opcion.servings) : opcion.label;
}

/** Nombre accesible de un tamaño: "8 personas · Caja mediana, $34" (sin repetir si el nombre ya es "8 personas"). */
function etiquetaAccesible(opcion: CatalogServingOption): string {
  const precio = formatPrice(opcion.price);
  if (opcion.servings === null) return `${opcion.label}, ${precio}`;
  const personas = `${opcion.servings} personas`;
  return opcion.label === personas ? `${personas}, ${precio}` : `${personas} · ${opcion.label}, ${precio}`;
}

/** Precio × cantidad en céntimos enteros (sin errores de coma flotante). Vista previa: el carrito recalcula. */
function totalVistaPrevia(precio: string | null, cantidad: number): string {
  const unitario = Number(precio);
  if (precio === null || !Number.isFinite(unitario)) return "";
  return formatPrice((Math.round(unitario * 100) * cantidad) / 100);
}

const ERROR_GENERICO = "No pudimos añadir el producto al carrito. Inténtalo de nuevo.";

const UUID = /\s*\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
/**
 * Mensajes del back que se muestran tal cual (sin los ids): los de disponibilidad del carrito, pertenencia y permisos
 * de la empresa, en español. El resto (validaciones técnicas, textos en inglés) lleva un mensaje propio por código.
 */
const MENSAJES_DEL_BACK = /no está disponible|no perteneces|no tienes permisos|desactivada/i;
/** 404 que no es del producto sino de la empresa activa (`Company with id … not found`). */
const ES_DE_EMPRESA = /\b(company|empresa)\b/i;

/** Fallo de `POST /cart/items` para el usuario. `noDisponible`: se ofrece volver a Ordenar. */
function errorCarrito(error: unknown): Extract<ResultadoCompra, { tipo: "error" }> {
  if (error instanceof TypeError) {
    return { tipo: "error", mensaje: "No pudimos conectar con Ofibites. Revisa tu conexión e inténtalo de nuevo." };
  }
  if (!isApiError(error)) return { tipo: "error", mensaje: ERROR_GENERICO };

  const delBack = getApiErrorMessages(error)[0] ?? "";
  if (error.statusCode < 500 && MENSAJES_DEL_BACK.test(delBack)) {
    const limpio = delBack.replace(UUID, "").trim();
    return {
      tipo: "error",
      mensaje: limpio.endsWith(".") ? limpio : `${limpio}.`,
      noDisponible: /no está disponible/i.test(limpio) && !ES_DE_EMPRESA.test(limpio),
    };
  }

  switch (error.statusCode) {
    case 400:
      return { tipo: "error", mensaje: "No pudimos añadir esta opción. Elige el tamaño de nuevo o recarga la página." };
    case 403:
      return {
        tipo: "error",
        mensaje: "Tu cuenta no puede añadir productos al carrito de la empresa. Si crees que es un error, contacta con Ofibites.",
      };
    case 404:
      return ES_DE_EMPRESA.test(delBack)
        ? { tipo: "error", mensaje: "No encontramos tu empresa. Cierra sesión y vuelve a entrar." }
        : { tipo: "error", mensaje: "Este producto ya no está disponible.", noDisponible: true };
    case 409:
      return { tipo: "error", mensaje: "El carrito cambió mientras lo actualizabas. Inténtalo de nuevo." };
    default:
      return { tipo: "error", mensaje: ERROR_GENERICO };
  }
}

/**
 * Panel blanco de la ficha (Figma 3097:28706): "‹ Volver", "Detalles de la caja", nombre, descripción, selector de
 * personas (solo productos con más de un tamaño), cantidad, "Añadir al carrito" (`POST /cart/items`) y total.
 */
export function PanelCompra({ item, imagenCaja }: PanelCompraProps) {
  const router = useRouter();
  const isCombo = item.kind === "combo";
  const opciones = item.servingOptions;
  const [sizeId, setSizeId] = useState<string | null>(() => opcionInicial(opciones));
  const [cantidad, setCantidad] = useState(1);
  const [isCajaOpen, setIsCajaOpen] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCompra | null>(null);
  const { mutate: addItem, isPending } = useAddCartItem();

  const opcion = opciones.find((it) => it.sizeId === sizeId) ?? null;
  // Combo o producto sin tamaños: precio único (`price`). Con tamaños, el de la opción elegida.
  const precio = isCombo || opciones.length === 0 ? item.price : (opcion?.price ?? null);
  const total = totalVistaPrevia(precio, cantidad);
  const tieneDetalles = item.ingredients.length > 0 || item.nutrition !== null;

  const volver = (event: MouseEvent<HTMLAnchorElement>) => {
    // A la página de la app de la que se vino, con su query (filtros de Ordenar); si se entró directamente, a
    // Ordenar. Sin `router.back()`: el historial puede salir de la app. Con modificadores, el enlace normal.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const anterior = rutaAnteriorCliente();
    if (anterior) marcarVueltaCliente();
    router.push(anterior ?? RUTA_ORDENAR);
  };

  const cambiarOpcion = (value: string) => {
    setSizeId(value);
    setResultado(null);
  };

  const cambiarCantidad = (value: number) => {
    setCantidad(value);
    setResultado(null);
  };

  const anadir = () => {
    if (isPending) return;
    if (item.hasRequiredModifiers) {
      setResultado({ tipo: "aviso" });
      return;
    }

    let body: AddCartItemRequest;
    if (isCombo) {
      // El back pide `productId` también en un combo: el primero de sus productos hace de ancla. Sin productos,
      // la línea no sería coherente: no se añade.
      const producto = item.comboItems[0];
      if (!producto) {
        setResultado({ tipo: "error", mensaje: ERROR_GENERICO });
        return;
      }
      body = { productId: producto.productId, comboId: item.id, quantity: cantidad };
    } else {
      body = { productId: item.id, quantity: cantidad, ...(opcion && { productSizeId: opcion.sizeId }) };
    }

    const descripcion = `${cantidad} × ${item.name}${opcion && opciones.length > 1 ? ` (${opcion.label})` : ""}`;
    setResultado(null);
    addItem(body, {
      onSuccess: () => setResultado({ tipo: "exito", descripcion }),
      onError: (error) => setResultado(errorCarrito(error)),
    });
  };

  return (
    <section
      aria-labelledby="ficha-nombre"
      className="flex flex-col gap-[22px] rounded-card bg-content1 px-5 py-7 sm:px-8 sm:py-9 xl:px-[47px] xl:pb-[39px] xl:pt-[39px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={RUTA_ORDENAR}
          onClick={volver}
          className={cn(
            "-ml-1 inline-flex h-8 items-center gap-2 rounded-full pl-1 pr-3 text-sm font-medium text-ghost-foreground",
            "transition-colors duration-(--duration-instant) ease-out hover:bg-background hover:text-primary",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          )}
        >
          <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={2} />
          Volver
        </Link>
        {tieneDetalles && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setIsCajaOpen(true)}
            className={cn(
              "inline-flex h-[27px] items-center gap-[11px] rounded-full bg-brand-soft px-[18px] text-xs font-semibold text-primary",
              "transition-[background-color,scale] duration-(--duration-instant) ease-out hover:bg-surface-sand active:scale-[0.97]",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            )}
          >
            <Image src="/images/icons/caja-detalle.svg" alt="" width={19} height={15} aria-hidden="true" />
            Detalles de la caja
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[22px]">
        <h2
          id="ficha-nombre"
          className="text-balance font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] text-primary sm:text-[36px]"
        >
          {item.name}
        </h2>
        {item.description && (
          <p className="max-w-[68ch] whitespace-pre-line text-pretty text-sm leading-[22px] text-primary">
            {item.description}
          </p>
        )}
        {isCombo && item.comboItems.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold leading-[22px] text-primary">Incluye</p>
            <ul className="flex flex-col gap-1 text-sm leading-[22px] text-primary">
              {item.comboItems.map((producto) => (
                <li key={producto.productId} className="flex gap-2">
                  <span className="min-w-6 font-bold tabular-nums">{`${producto.quantity} ×`}</span>
                  {producto.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[35px] pt-1">
        {!isCombo && opciones.length > 1 && (
          <MlSegmentedControl
            name="personas"
            label="Selecciona la cantidad de personas"
            options={opciones.map((it) => ({
              value: it.sizeId,
              label: etiquetaOpcion(it),
              ariaLabel: etiquetaAccesible(it),
            }))}
            value={sizeId}
            onChange={cambiarOpcion}
          />
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-[18px]">
            <MlQuantityStepper
              value={cantidad}
              onChange={cambiarCantidad}
              max={MAX_CANTIDAD}
              className="min-[420px]:w-[137px] min-[420px]:shrink-0"
            />
            <AtButton
              size="md"
              // En columna (móvil) `flex-1` aplastaría el alto: solo crece en fila.
              className="w-full min-[420px]:flex-1"
              startContent={isPending ? undefined : <Plus aria-hidden="true" className="size-[15px]" strokeWidth={2.5} />}
              isLoading={isPending}
              onPress={anadir}
            >
              {isPending ? "Añadiendo…" : "Añadir al carrito"}
            </AtButton>
          </div>
          <AvisoCompra resultado={resultado} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <p aria-hidden="true" className="text-sm font-bold leading-[22px] text-primary">
            Total del pedido
          </p>
          <output
            id="ficha-total"
            aria-live="polite"
            aria-atomic="true"
            className="flex h-[52px] min-w-[138px] items-center justify-center rounded-control border-1 border-primary px-5 text-[19px] font-bold tabular-nums text-primary"
          >
            <span className="sr-only">Total del pedido: </span>
            {total}
          </output>
        </div>
      </div>

      {tieneDetalles && (
        <OrBoxDetailsModal
          isOpen={isCajaOpen}
          onOpenChange={setIsCajaOpen}
          productName={item.name}
          imageSrc={imagenCaja}
          ingredients={item.ingredients.map(({ id, name, image }) => ({ id, name, imageSrc: image }))}
          nutrition={item.nutrition}
        />
      )}
    </section>
  );
}
