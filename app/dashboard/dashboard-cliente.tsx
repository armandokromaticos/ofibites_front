"use client";

import { ReactNode, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, LayoutGrid, Truck } from "lucide-react";

import { useLogout } from "@/domain/hooks/auth";
import { useClientDashboard } from "@/domain/hooks/dashboard";
import {
  ClientActiveOrder,
  ClientRecentOrder,
  ClientRecommendationCategory,
  ORDER_STATUS_LABELS,
  OrderStatus,
  RECOMMENDATION_CATEGORY_LABELS,
} from "@/domain/models";
import { duration, ease, fadeRise, listStagger } from "@/shared/motion";
import { formatCaracasShortDate, formatCaracasTime } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  MlActiveOrderCard,
  MlActiveOrderCardOrder,
  MlActiveOrderCardStep,
  MlEmptyState,
  MlFilterChips,
  MlFormAlert,
  MlGreetingCard,
  MlPromoBanner,
  OrProductCard,
  OrPromoCarousel,
  OrRecentOrders,
  OrRecentOrdersItem,
  TmAppLayout,
} from "@/app/lib/atomic";

import { EstadoQaDashboard } from "./datos-ejemplo";
import {
  NAV_ITEMS_CLIENTE,
  parseCategoriaOrdenar,
  RUTA_ORDENAR,
  RUTA_PEDIDOS,
  rutaOrdenarCategoria,
  rutaOrdenarRepetir,
} from "./navegacion-cliente";

// Reacción de la imagen de cada categoría al pasar (entrega de diseño): botellas que se inclinan, cajas que crecen.
// TODO: conectar API (T-04). Si las categorías vienen del back, esto pasa a ser un dato de la categoría.
const CATEGORY_IMAGE_HOVER: Record<string, "tilt" | "zoom"> = {
  bebidas: "tilt",
  desayunos: "zoom",
};

/** Enlace de una categoría a Ordenar; con un id que Ordenar no conoce, a Ordenar sin filtro. */
function categoryHref(id: string): string {
  const categoria = parseCategoriaOrdenar(id);
  return categoria ? rutaOrdenarCategoria(categoria) : RUTA_ORDENAR;
}

// Filtros de "Según tus preferencias" (entrega de diseño): Todos · Desayunos · Coffee break · Bebidas.
type RecommendationFilter = "todos" | ClientRecommendationCategory;

const RECOMMENDATION_FILTERS: { value: RecommendationFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...(Object.keys(RECOMMENDATION_CATEGORY_LABELS) as ClientRecommendationCategory[]).map((value) => ({
    value,
    label: RECOMMENDATION_CATEGORY_LABELS[value],
  })),
];

/** Salida de la lista al cambiar de filtro: fundido corto que acelera. */
const LIST_EXIT = { opacity: 0, transition: { duration: duration.fast, ease: ease.in } };

// Camino principal del pedido (OrderStateMachine): Confirmado → En preparación → En camino → Entregado.
// Antes de confirmar (creado, por aprobar, por confirmar, en ajuste) ningún paso está hecho.
const ORDER_STEPS: OrderStatus[] = ["CONFIRMED", "IN_PREPARATION", "IN_TRANSIT", "DELIVERED"];

function toOrderSteps(status: OrderStatus): MlActiveOrderCardStep[] | undefined {
  if (status === "REJECTED" || status === "CANCELLED") return undefined;
  const reached = ORDER_STEPS.indexOf(status);
  return ORDER_STEPS.map((step, stepIndex) => ({
    label: ORDER_STATUS_LABELS[step],
    isDone: stepIndex <= reached,
  }));
}

const STATUS_ICONS: Partial<Record<OrderStatus, ReactNode>> = {
  IN_TRANSIT: <Truck aria-hidden="true" className="size-3" />,
};

function formatBoxes(boxes: number): string {
  return `${boxes} ${boxes === 1 ? "box" : "boxes"}`;
}

function toActiveOrderCard(order: ClientActiveOrder): MlActiveOrderCardOrder {
  return {
    productName: order.productName,
    quantityLabel: formatBoxes(order.boxes),
    etaLabel: `Llega a las ${formatCaracasTime(order.estimatedArrival)}`,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    statusIcon: STATUS_ICONS[order.status],
    isInTransit: order.status === "IN_TRANSIT",
    steps: toOrderSteps(order.status),
    progress: order.progress,
  };
}

function toRecentOrderItem(order: ClientRecentOrder): OrRecentOrdersItem {
  return {
    id: order.id,
    productName: order.productName,
    quantityLabel: formatBoxes(order.boxes),
    statusLabel: ORDER_STATUS_LABELS[order.status],
    statusIcon: STATUS_ICONS[order.status],
    address: order.address,
    orderNumber: order.number,
    dateLabel: formatCaracasShortDate(order.createdAt),
    dateTime: order.createdAt,
    detailHref: `${RUTA_PEDIDOS}/${order.id}`,
    // TODO: repetir pedido (T-19). Aún no hay carrito: Ordenar recibe el pedido y avisa de que llega pronto.
    repeatHref: rutaOrdenarRepetir(order.id),
  };
}

function TopSkeleton() {
  return (
    <div className="flex flex-col gap-[27px]">
      <AtSkeleton className="h-[307px] rounded-card" />
      <div className="grid gap-[27px] lg:grid-cols-2">
        <AtSkeleton className="h-[188px] rounded-card" />
        <AtSkeleton className="h-[188px] rounded-card" />
      </div>
    </div>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <AtSkeleton className="h-9 w-72 max-w-full rounded-full" />
      <div className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3">
        <AtSkeleton className="h-[407px] rounded-card" />
        <AtSkeleton className="hidden h-[407px] rounded-card sm:block" />
        <AtSkeleton className="hidden h-[407px] rounded-card lg:block" />
      </div>
    </div>
  );
}

interface DashboardClienteProps {
  estadoQa?: EstadoQaDashboard;
}

export function DashboardCliente({ estadoQa }: DashboardClienteProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data, isPending, isError, isFetching, refetch } = useClientDashboard({ qaState: estadoQa });
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  // Las recomendaciones entran escalonadas solo cuando sustituyen al esqueleto de carga. Con datos ya
  // en caché llegan con la página, sin una segunda entrada encima de la transición de ruta.
  const [startedLoading] = useState(isPending);
  const [filter, setFilter] = useState<RecommendationFilter>("todos");
  const recommendations = data?.recommendations ?? [];
  const visibleRecommendations =
    filter === "todos" ? recommendations : recommendations.filter((product) => product.category === filter);
  const filterLabel = filter === "todos" ? "Todos" : RECOMMENDATION_CATEGORY_LABELS[filter];
  const filterAnnouncement = filter === "todos"
    ? `Todas las recomendaciones: ${visibleRecommendations.length}`
    : `${visibleRecommendations.length} ${visibleRecommendations.length === 1 ? "recomendación" : "recomendaciones"} de ${filterLabel}`;
  const recommendationsMotion = listStagger(visibleRecommendations.length);
  const categoriesMotion = listStagger(data?.categories.length ?? 0);

  const user = data?.user;

  let content: ReactNode;
  if (isError && !data) {
    content = (
      <div className="mx-auto w-full max-w-xl rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          headingLevel={2}
          icon={<CloudOff />}
          title="No pudimos cargar tu dashboard"
          description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => refetch()}
          isActionLoading={isFetching}
        />
      </div>
    );
  } else {
    /*
     * Una sola rejilla con las cuatro piezas en orden de lectura (promos y categorías, saludo y pedido en
     * curso, recomendaciones, últimas órdenes):
     * - Hasta xl, una columna en ese orden; desde md, saludo y pedido en curso van lado a lado.
     * - xl (≥ 1280): las dos columnas del Figma. La de 288 px apila saludo y últimas órdenes sin depender de
     *   la altura de las promos: estas ocupan las filas 1-2 y las órdenes las filas 2-3.
     */
    content = (
      <div className="flex flex-col gap-[27px]">
        {/* Falló una actualización pero hay datos previos: aviso discreto y se siguen mostrando. */}
        {isError && (
          <MlFormAlert title="No pudimos actualizar tu dashboard.">
            Te mostramos los últimos datos cargados.{" "}
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
        <div className="grid grid-cols-1 items-start gap-[27px] xl:grid-cols-[minmax(0,1fr)_288px] xl:gap-x-[29px] xl:gap-y-[14px]">
          <div
            aria-busy={isPending || undefined}
            className="min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1"
          >
            {isPending ? (
              <>
                <span className="sr-only">Cargando promociones y recomendaciones</span>
                <TopSkeleton />
              </>
            ) : (
              <div className="flex flex-col gap-[27px]">
                <OrPromoCarousel slides={data.promotions} />

                {/* Cada categoría enlaza a Ordenar filtrado (la pantalla real llega con T-19). */}
                <motion.div
                  className="grid gap-[27px] lg:grid-cols-2"
                  variants={categoriesMotion.container}
                  initial={startedLoading ? "hidden" : false}
                  animate="visible"
                >
                  {data.categories.map((category) => (
                    <motion.div key={category.id} variants={categoriesMotion.item} className="flex">
                      <MlPromoBanner
                        variant="secondary"
                        title={category.title}
                        subtitle={category.subtitle}
                        imageSrc={category.imageSrc}
                        imageAlt={category.imageAlt}
                        imagePosition={category.imagePosition}
                        imageFit={category.imageFit}
                        imageHover={CATEGORY_IMAGE_HOVER[category.id] ?? "zoom"}
                        href={categoryHref(category.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </div>

          <section
            aria-label="Tu actividad"
            className="flex min-w-0 flex-col gap-[14px] md:grid md:grid-cols-2 md:gap-[27px] xl:col-start-2 xl:row-start-1 xl:flex xl:gap-[14px]"
          >
            <MlGreetingCard name={user?.displayName ?? ""} isLoading={isPending} ctaHref={RUTA_ORDENAR} />
            {/* Al llegar los datos (tras el esqueleto), la card entra con fadeRise. */}
            <motion.div
              key={isPending ? "cargando" : "lista"}
              variants={fadeRise}
              initial={startedLoading && !isPending ? "hidden" : false}
              animate="visible"
              // En md va junto al saludo: misma altura.
              className="flex flex-col"
            >
              <MlActiveOrderCard
                className="flex-1"
                isLoading={isPending}
                order={data?.activeOrder ? toActiveOrderCard(data.activeOrder) : null}
              />
            </motion.div>
          </section>

          {(isPending || data.recommendations.length > 0) && (
            <div
              aria-busy={isPending || undefined}
              // En xl la separación entre filas es la de la columna derecha (14 px): 13 más hasta los 27.
              className="min-w-0 xl:col-start-1 xl:row-start-3 xl:mt-[13px]"
            >
              {isPending ? (
                <RecommendationsSkeleton />
              ) : (
                <section aria-labelledby="preferencias-titulo" className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <h2
                      id="preferencias-titulo"
                      className="font-display text-[28px] font-bold leading-[37px] tracking-[-0.04em] text-foreground"
                    >
                      Según tus preferencias
                    </h2>
                    <MlFilterChips
                      label="Filtrar recomendaciones"
                      options={RECOMMENDATION_FILTERS}
                      value={filter}
                      onChange={setFilter}
                    />
                  </div>
                  {/* Resultado del filtro para lectores de pantalla (no se anuncia al cargar). */}
                  <p aria-live="polite" className="sr-only">
                    {filterAnnouncement}
                  </p>
                  {/* Al filtrar: la lista sale con un fundido corto y la nueva entra escalonada. */}
                  <AnimatePresence mode="wait" initial={startedLoading}>
                    <motion.div
                      key={filter}
                      className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3"
                      variants={{ ...recommendationsMotion.container, exit: LIST_EXIT }}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {visibleRecommendations.length === 0 ? (
                        <motion.div
                          variants={recommendationsMotion.item}
                          className="rounded-card bg-content1 sm:col-span-2 lg:col-span-3"
                        >
                          <MlEmptyState
                            size="sm"
                            headingLevel={3}
                            title={`Aún no tenemos recomendaciones de ${filterLabel.toLowerCase()}`}
                            description="Prueba con otra categoría o mira todas las recomendaciones."
                            actionLabel="Ver todas"
                            onAction={() => setFilter("todos")}
                          />
                        </motion.div>
                      ) : (
                        visibleRecommendations.map((product) => {
                          const quantity = quantities[product.id] ?? 1;
                          return (
                            <motion.div key={product.id} variants={recommendationsMotion.item} className="flex">
                              <OrProductCard
                                className="w-full"
                                title={product.name}
                                description={product.description}
                                imageSrc={product.imageSrc}
                                imageAlt={product.imageAlt}
                                imageKind={product.imageKind}
                                quantity={quantity}
                                onQuantityChange={(value) =>
                                  setQuantities((prev) => ({ ...prev, [product.id]: value }))
                                }
                                // TODO: conectar API (T-04). Añadir al carrito cuando exista; hoy lleva a Ordenar.
                                ctaHref={`${RUTA_ORDENAR}?producto=${product.id}&cantidad=${quantity}`}
                              />
                            </motion.div>
                          );
                        })
                      )}
                    </motion.div>
                  </AnimatePresence>
                </section>
              )}
            </div>
          )}

          <OrRecentOrders
            className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-2"
            isLoading={isPending}
            orders={data?.recentOrders.map(toRecentOrderItem) ?? []}
            viewAllHref={RUTA_PEDIDOS}
            emptyActionHref={RUTA_ORDENAR}
          />
        </div>
      </div>
    );
  }

  return (
    <TmAppLayout
      title="Dashboard"
      titleIcon={<LayoutGrid />}
      sidebar={{
        items: NAV_ITEMS_CLIENTE,
        activeKey: "dashboard",
        isOpen: isSidebarOpen,
        onToggle: () => setIsSidebarOpen((open) => !open),
        onClose: () => setIsSidebarOpen(false),
        homeHref: "/dashboard",
        onLogout: () => logout(),
        isLoggingOut,
        user: user ? { name: user.shortName, role: user.role, avatarSrc: user.avatarSrc } : undefined,
      }}
      // TODO: conectar API (T-04). Contador del carrito y notificaciones sin leer.
      cart={{ href: "/carrito" }}
      notifications={{}}
      mainClassName="px-4 pb-10 pt-6 sm:px-8 xl:pt-[42px]"
    >
      {content}
    </TmAppLayout>
  );
}
