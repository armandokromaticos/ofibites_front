"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, RotateCcw, SearchX, SlidersHorizontal, TriangleAlert, Utensils } from "lucide-react";

import { EstadoQaCatalogo, useCatalog } from "@/domain/hooks/catalog";
import { CatalogFilter, CatalogQuery, CatalogResponse } from "@/domain/types";
import { duration, ease, listStagger } from "@/shared/motion";
import { formatPriceRange, isApiError } from "@/shared/utils";
import {
  AtButton,
  AtDrawer,
  AtSkeleton,
  MlCategoryPicker,
  MlCategoryPickerOption,
  MlEmptyState,
  MlFilterChipsOption,
  MlFormAlert,
  MlPagination,
  MlPromoBanner,
  MlSearchBar,
  OrCatalogCard,
  OrCatalogFilters,
} from "@/ui/atomic";

import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../_data/imagenes";
import { rutaProducto } from "../../_navegacion";
import {
  CATEGORIA_TODOS,
  ilustracionCategoria,
} from "../_data/ilustraciones-categorias";

import { AvisoCatalogo } from "./aviso-catalogo";
import { FiltroLista, FiltrosCatalogo, firmaFiltros, useFiltrosCatalogo } from "./use-filtros-catalogo";

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 300;
const MIN_BUSQUEDA = 2;

const FILTROS: MlFilterChipsOption<FiltroLista>[] = [
  { value: "todo", label: "Todo" },
  { value: "oferta", label: "En oferta" },
  { value: "nuevos", label: "Nuevos" },
];

const FILTRO_API: Record<FiltroLista, CatalogFilter | undefined> = {
  todo: undefined,
  oferta: "on-sale",
  nuevos: "new",
};

/** Salida de la lista al cambiar de filtros: fundido corto que acelera. */
const LIST_EXIT = { opacity: 0, transition: { duration: duration.fast, ease: ease.in } };

function productos(n: number): string {
  return `${n} ${n === 1 ? "producto" : "productos"}`;
}

function opcionesCategorias(data: CatalogResponse): MlCategoryPickerOption[] {
  return [
    {
      value: CATEGORIA_TODOS,
      name: "Todos",
      caption: productos(data.totalItems),
      imageSrc: ilustracionCategoria(CATEGORIA_TODOS),
    },
    ...[...data.categories]
      .sort((a, b) => a.order - b.order)
      .map((categoria) => ({
        value: categoria.slug,
        name: categoria.name,
        caption: productos(categoria.count),
        imageSrc: ilustracionCategoria(categoria.slug),
      })),
  ];
}

function CategoriasSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-4 overflow-hidden py-1">
      {Array.from({ length: 6 }, (_, i) => (
        <AtSkeleton key={i} className="h-[83px] min-w-[188px] flex-[1_0_auto] rounded-[10px]" />
      ))}
    </div>
  );
}

function ProductosSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-[27px] sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={i >= 2 ? "hidden flex-col gap-4 rounded-card bg-content1 p-4 sm:flex" : "flex flex-col gap-4 rounded-card bg-content1 p-4"}
        >
          <AtSkeleton className="aspect-[297/294] w-full rounded-2xl" />
          <AtSkeleton className="h-5 w-3/4 rounded-full" />
          <AtSkeleton className="h-3 w-full rounded-full" />
          <AtSkeleton className="h-4 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function prefiereMovimientoReducido(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface OrdenarCatalogoProps {
  estadoQa?: EstadoQaCatalogo;
}

/** Aviso sobre filtros que el catálogo no acepta: se muestra el catálogo sin ellos y se limpia la URL. */
interface AvisoFiltros {
  tipo: "categoria" | "filtros";
  /** Slug rechazado (404). */
  slug?: string;
  /** Firma de los filtros rechazados: mientras la URL siga en ella, hay que limpiarla. */
  origen: string;
  /** Firma tras limpiar: el aviso sigue mientras la URL esté en `origen` o aquí; otro cambio lo cierra. */
  destino: string;
}

const SIN_FILTROS: Pick<FiltrosCatalogo, "categoria" | "tags" | "filtro" | "q" | "pagina"> = {
  categoria: undefined,
  tags: [],
  filtro: "todo",
  q: "",
  pagina: 1,
};

/**
 * Pantalla Ordenar (Figma 3067:17606): banner, categorías, filtros y preferencias, buscador y rejilla de
 * surtidos con paginación. Todo el estado de filtros vive en la URL (`useFiltrosCatalogo`).
 */
export function OrdenarCatalogo({ estadoQa }: OrdenarCatalogoProps) {
  const { filtros, actualizar } = useFiltrosCatalogo();
  const resultadosRef = useRef<HTMLElement>(null);
  const productosTituloRef = useRef<HTMLHeadingElement>(null);
  const firma = firmaFiltros(filtros);

  const [texto, setTexto] = useState(filtros.q);
  const [aviso, setAviso] = useState<AvisoFiltros>();

  // Cambio de filtros desde fuera del buscador (enlace "Ordenar" del sidebar, atrás/adelante, "Quitar
  // filtros", limpieza de la URL): se ajusta durante el render. El buscador toma la `q` nueva (así el
  // debounce no vuelve a escribir la anterior) y un aviso de filtros que ya no corresponde se cierra.
  const [previo, setPrevio] = useState({ firma, q: filtros.q });
  if (previo.firma !== firma) {
    setPrevio({ firma, q: filtros.q });
    if (filtros.q !== previo.q && texto.trim() !== filtros.q) setTexto(filtros.q);
    if (aviso && firma !== aviso.origen && firma !== aviso.destino) setAviso(undefined);
  }

  // Buscador: el texto se escribe al momento y llega a la URL (y a la API) 300 ms después de dejar de teclear.
  useEffect(() => {
    const limpio = texto.trim();
    if (limpio === filtros.q) return;
    const timer = setTimeout(() => actualizar({ q: limpio }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [texto, filtros.q, actualizar]);

  const busqueda = filtros.q.length >= MIN_BUSQUEDA ? filtros.q : undefined;
  const query = useMemo<CatalogQuery>(
    () => ({
      section: filtros.categoria,
      tags: filtros.tags.length ? [...filtros.tags].sort() : undefined,
      filter: FILTRO_API[filtros.filtro],
      search: busqueda,
      page: filtros.pagina,
      pageSize: PAGE_SIZE,
    }),
    [filtros.categoria, filtros.tags, filtros.filtro, busqueda, filtros.pagina],
  );

  const catalogo = useCatalog(query, { qaState: estadoQa });
  const { data: dataActual, error, isPending, isError, isFetching, isPlaceholderData } = catalogo;
  const { refetch } = catalogo;

  // Último catálogo recibido: si falla la petición de un filtro nuevo, se siguen mostrando categorías,
  // filtros y rejilla anteriores con un aviso (el error a pantalla completa solo si nunca hubo datos).
  const [ultimo, setUltimo] = useState(dataActual);
  if (dataActual && dataActual !== ultimo) setUltimo(dataActual);
  const data = dataActual ?? ultimo;
  const muestraAnteriores = !dataActual && Boolean(ultimo);

  // Los productos entran escalonados solo cuando sustituyen al esqueleto de la primera carga.
  const [startedLoading] = useState(isPending);

  // Filtros que el catálogo rechaza (404 de sección, 400 de parámetros) o que el front ya sabe inválidos en
  // la URL: se avisa (ajuste en el render) y se limpia la URL (efecto), sin pantalla de error.
  const estado = isError && isApiError(error) ? error.statusCode : undefined;
  const rechazo404 = estado === 404 && Boolean(filtros.categoria);
  const rechazo400 = estado === 400 || (estado === 404 && !filtros.categoria);
  if ((rechazo404 || rechazo400) && aviso?.origen !== firma) {
    setAviso(
      rechazo404
        ? {
            tipo: "categoria",
            slug: filtros.categoria,
            origen: firma,
            destino: firmaFiltros({ ...filtros, categoria: undefined, pagina: 1 }),
          }
        : { tipo: "filtros", origen: firma, destino: firmaFiltros(SIN_FILTROS) },
    );
  } else if (filtros.invalidos.length > 0 && aviso?.origen !== firma) {
    setAviso({ tipo: "filtros", origen: firma, destino: firma });
  }

  useEffect(() => {
    if (filtros.invalidos.length > 0) {
      // Reescribe la URL con los valores saneados: quita lo inválido y conserva el resto (y la página).
      const { categoria, tags, filtro, pagina } = filtros;
      actualizar({ categoria, tags, filtro, pagina });
    } else if (aviso && firma === aviso.origen && aviso.origen !== aviso.destino) {
      actualizar(aviso.tipo === "categoria" ? { categoria: undefined } : SIN_FILTROS);
    }
  }, [aviso, firma, filtros, actualizar]);

  const [panelAbierto, setPanelAbierto] = useState(false);
  const [panelLado, setPanelLado] = useState<"right" | "bottom">("bottom");

  const filtrosActivos = (filtros.filtro !== "todo" ? 1 : 0) + filtros.tags.length;
  const hayFiltros = Boolean(filtros.categoria) || filtrosActivos > 0 || filtros.q.length > 0;

  const elegirCategoria = (value: string) => {
    actualizar({ categoria: value === CATEGORIA_TODOS ? undefined : value });
  };

  const quitarFiltros = () => {
    setTexto("");
    actualizar(SIN_FILTROS);
  };

  const irAPagina = (pagina: number) => {
    actualizar({ pagina });
    resultadosRef.current?.scrollIntoView({
      block: "start",
      behavior: prefiereMovimientoReducido() ? "auto" : "smooth",
    });
    // El foco pasa al inicio de los resultados (sin otro scroll) para seguir leyendo desde ahí.
    productosTituloRef.current?.focus({ preventScroll: true });
  };

  const abrirPanel = () => {
    setPanelLado(window.matchMedia("(min-width: 768px)").matches ? "right" : "bottom");
    setPanelAbierto(true);
  };

  const items = data?.items;
  const totalPaginas = items ? Math.max(1, Math.ceil(items.total / items.pageSize)) : 1;
  const preferencias = data?.preferences ?? [];
  const actualizando = isPlaceholderData || (muestraAnteriores && isFetching);

  const filtrosProps = {
    filterOptions: FILTROS,
    filter: filtros.filtro,
    onFilterChange: (filtro: FiltroLista) => actualizar({ filtro }),
    preferences: preferencias,
    selectedPreferences: filtros.tags,
    onPreferencesChange: (tags: string[]) => actualizar({ tags }),
    isLoadingPreferences: !data && isPending,
  };

  let resumen: string;
  if (!data && isPending) resumen = "Cargando productos…";
  else if (!items) resumen = "";
  else if (busqueda && !muestraAnteriores) resumen = `${productos(items.total)} para «${busqueda}»`;
  else resumen = productos(items.total);
  const pistaBusqueda = texto.trim().length > 0 && texto.trim().length < MIN_BUSQUEDA;

  const listaKey = items ? `${items.page}:${items.data.map((item) => item.id).join(",")}` : "sin-datos";
  const listaMotion = listStagger(items?.data.length ?? 0);

  let resultados: ReactNode;
  if (!data && isPending) {
    resultados = <ProductosSkeleton />;
  } else if (!data) {
    resultados = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          headingLevel={3}
          icon={<CloudOff />}
          title="No pudimos cargar el catálogo"
          description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => refetch()}
          isActionLoading={isFetching}
        />
      </div>
    );
  } else if (data.items.total === 0) {
    resultados = (
      <div className="rounded-card bg-content1">
        {hayFiltros ? (
          <MlEmptyState
            headingLevel={3}
            icon={<SearchX />}
            title={busqueda ? `No encontramos productos para «${busqueda}»` : "No hay productos con estos filtros"}
            description="Prueba con otra categoría o quita algún filtro para ver más surtidos."
            actionLabel="Quitar filtros"
            onAction={quitarFiltros}
          />
        ) : (
          <MlEmptyState
            headingLevel={3}
            icon={<Utensils />}
            title="Aún no hay productos en el catálogo"
            description="Estamos preparando los surtidos. Vuelve a intentarlo en un rato."
          />
        )}
      </div>
    );
  } else if (data.items.data.length === 0) {
    // `?pagina=` más allá de la última (enlace viejo o el catálogo cambió).
    resultados = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          headingLevel={3}
          icon={<SearchX />}
          title="Esta página ya no tiene productos"
          description={`El catálogo tiene ${totalPaginas} ${totalPaginas === 1 ? "página" : "páginas"} con estos filtros.`}
          actionLabel="Ir a la primera página"
          onAction={() => irAPagina(1)}
        />
      </div>
    );
  } else {
    resultados = (
      <AnimatePresence mode="wait" initial={startedLoading}>
        <motion.ul
          key={listaKey}
          className="grid gap-[27px] sm:grid-cols-2 xl:grid-cols-3"
          variants={{ ...listaMotion.container, exit: LIST_EXIT }}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {data.items.data.map((item, index) => (
            <motion.li key={item.id} variants={listaMotion.item} className="flex">
              <OrCatalogCard
                className="w-full"
                name={item.name}
                description={item.description}
                // La foto es ilustrativa: el nombre ya dice qué es.
                imageSrc={item.image ?? IMAGEN_PRODUCTO_POR_DEFECTO}
                imageAlt=""
                priceLabel={formatPriceRange(item.priceFrom, item.priceTo)}
                href={rutaProducto(item.id, item.kind)}
                isFeatured={item.isFeatured}
                isOnSale={item.isOnSale}
                preloadImage={index < 3}
              />
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    );
  }

  const fallaActualizar = isError && !(rechazo404 || rechazo400) && muestraAnteriores;

  return (
    <div className="flex flex-col gap-10 xl:gap-[50px]">
      {(filtros.repetir || aviso) && (
        <div className="-mb-4 flex flex-col gap-3 xl:-mb-6">
          {filtros.repetir && (
            // TODO: repetir pedido (T-19). Con el carrito, "Repetir" lo precargará con este pedido.
            <AvisoCatalogo icon={<RotateCcw />} onClose={() => actualizar({ repetir: undefined })}>
              Repetir el pedido #{filtros.repetir} llegará pronto. Mientras tanto, puedes elegir tus
              surtidos aquí.
            </AvisoCatalogo>
          )}
          {aviso && (
            <AvisoCatalogo icon={<TriangleAlert />} onClose={() => setAviso(undefined)}>
              {aviso.tipo === "categoria"
                ? `No encontramos la categoría «${aviso.slug}». Te mostramos todo el catálogo.`
                : "Algunos filtros del enlace no son válidos y los quitamos. Te mostramos el catálogo sin ellos."}
            </AvisoCatalogo>
          )}
        </div>
      )}

      <MlPromoBanner
        variant="hero"
        title="Coffee Break Box premium"
        subtitle="Elige la combinación ideal para las reuniones, eventos y pausas de tu equipo."
        imageSrc="/images/banners/ordenar-principal.png"
        imageAlt=""
      />

      {/* Sin datos por un error, la sección no se pinta (el error y "Reintentar" van en los resultados). */}
      {data || isPending ? (
        <section aria-labelledby="categorias-titulo" className="flex flex-col gap-6">
          <h2
            id="categorias-titulo"
            className="font-display text-[28px] font-bold leading-[37px] tracking-[-0.04em] text-foreground"
          >
            Nuestras categorías
          </h2>
          {data ? (
            <MlCategoryPicker
              label="Categorías"
              options={opcionesCategorias(data)}
              value={filtros.categoria ?? CATEGORIA_TODOS}
              onChange={elegirCategoria}
              // La fila se desplaza hasta el borde de la pantalla (padding del <main>: 16 / 32 px).
              className="-mx-4 scroll-px-4 px-4 sm:-mx-8 sm:scroll-px-8 sm:px-8"
            />
          ) : (
            <CategoriasSkeleton />
          )}
        </section>
      ) : null}

      <div className="grid gap-[29px] lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)]">
        <aside aria-label="Filtros del catálogo" className="hidden lg:block lg:pl-[25px] lg:pt-2.5">
          <OrCatalogFilters idPrefix="columna" layout="column" {...filtrosProps} />
        </aside>

        <section
          ref={resultadosRef}
          aria-labelledby="productos-titulo"
          aria-busy={(!data && isPending) || actualizando || undefined}
          className="flex min-w-0 scroll-mt-6 flex-col gap-5"
        >
          <h2 id="productos-titulo" ref={productosTituloRef} tabIndex={-1} className="sr-only">
            Productos
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm font-semibold text-muted">
              {pistaBusqueda ? "Escribe al menos 2 letras para buscar" : resumen}
            </p>
            <div className="flex items-center gap-3">
              <MlSearchBar
                variant="catalog"
                label="Buscar en el catálogo"
                placeholder="Buscar surtidos…"
                value={texto}
                onValueChange={setTexto}
                className="min-w-0 flex-1 sm:w-[300px] sm:flex-none"
              />
              <AtButton
                variant="bordered"
                color="default"
                aria-label={filtrosActivos ? `Filtros, ${filtrosActivos} activos` : "Filtros"}
                onPress={abrirPanel}
                startContent={<SlidersHorizontal aria-hidden="true" className="size-4" />}
                className="h-12 shrink-0 border-small border-border-input bg-content1 px-4 text-sm text-primary lg:hidden"
              >
                Filtros
                {filtrosActivos > 0 && (
                  <span
                    aria-hidden="true"
                    className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
                  >
                    {filtrosActivos}
                  </span>
                )}
              </AtButton>
            </div>
          </div>

          {fallaActualizar && (
            <MlFormAlert title="No pudimos actualizar el catálogo.">
              Te mostramos los últimos productos cargados.{" "}
              <AtButton
                size="xs"
                variant="light"
                color="default"
                className="h-auto min-w-0 px-1 align-baseline text-[13px] text-primary underline underline-offset-2"
                onPress={() => refetch()}
                isLoading={isFetching}
              >
                Reintentar
              </AtButton>
            </MlFormAlert>
          )}

          <div
            className={
              actualizando
                ? "opacity-60 transition-opacity duration-(--duration-fast)"
                : "transition-opacity duration-(--duration-fast)"
            }
          >
            {resultados}
          </div>

          {items && items.data.length > 0 && (
            <MlPagination
              className="mt-4"
              label="Páginas del catálogo"
              page={items.page}
              totalPages={totalPaginas}
              onChange={irAPagina}
            />
          )}
        </section>
      </div>

      <AtDrawer
        isOpen={panelAbierto}
        onOpenChange={setPanelAbierto}
        placement={panelLado}
        size={panelLado === "bottom" ? "lg" : "sm"}
        classNames={{ base: panelLado === "bottom" ? "rounded-t-card bg-background" : "bg-background" }}
      >
        <DrawerContent>
          {(cerrar) => (
            <>
              <DrawerHeader className="font-display text-[22px] font-bold text-foreground">
                Filtrar catálogo
              </DrawerHeader>
              <DrawerBody>
                <OrCatalogFilters idPrefix="panel" layout="panel" headingLevel={3} {...filtrosProps} />
              </DrawerBody>
              <DrawerFooter className="flex gap-3">
                <AtButton
                  variant="light"
                  color="default"
                  className="text-ghost-foreground"
                  onPress={quitarFiltros}
                  aria-disabled={!hayFiltros || undefined}
                >
                  Quitar filtros
                </AtButton>
                <AtButton className="flex-1" onPress={cerrar}>
                  {items ? `Ver ${productos(items.total)}` : "Ver productos"}
                </AtButton>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </AtDrawer>
    </div>
  );
}
