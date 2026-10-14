"use client";

import { ReactNode, useState } from "react";

import { BookOpen, CloudOff, FileText, LayoutGrid, Truck, Utensils } from "lucide-react";

import { useClientDashboard } from "@/domain/hooks/dashboard";
import { ClientActiveOrder, ClientRecentOrder, ORDER_STATUS_LABELS, OrderStatus } from "@/domain/models";
import { formatCaracasShortDate, formatCaracasTime } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  MlActiveOrderCard,
  MlActiveOrderCardOrder,
  MlEmptyState,
  MlFormAlert,
  MlGreetingCard,
  MlPromoBanner,
  OrAppSidebarItem,
  OrProductCard,
  OrPromoCarousel,
  OrRecentOrders,
  OrRecentOrdersItem,
  TmAppLayout,
} from "@/app/lib/atomic";

import { EstadoQaDashboard } from "./datos-ejemplo";

// Rutas del cliente que aún no existen (Ordenar, Pedidos...): los enlaces ya apuntan a su sitio.
const RUTA_ORDENAR = "/ordenar";
const RUTA_PEDIDOS = "/pedidos";
// TODO: conectar API (T-04). El Figma no fija la ruta de "Data y consumo": provisional.
const RUTA_CONSUMO = "/consumo";

const NAV_ITEMS: OrAppSidebarItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Panel de control", href: "/dashboard", icon: <LayoutGrid /> },
  { key: "ordenar", label: "Ordenar", description: "Pide comida a la oficina", href: RUTA_ORDENAR, icon: <Utensils /> },
  { key: "consumo", label: "Data y consumo", description: "Reportes y consumo", href: RUTA_CONSUMO, icon: <FileText /> },
  {
    key: "administracion",
    label: "Administración",
    description: "Control de usuarios",
    href: "/administracion",
    icon: <BookOpen />,
  },
];

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
  };
}

function MainColumnSkeleton() {
  return (
    <div className="flex flex-col gap-[27px]">
      <AtSkeleton className="h-[307px] rounded-card" />
      <div className="grid gap-[27px] lg:grid-cols-2">
        <AtSkeleton className="h-[188px] rounded-card" />
        <AtSkeleton className="h-[188px] rounded-card" />
      </div>
      <div className="flex flex-col gap-6">
        <AtSkeleton className="h-9 w-72 max-w-full rounded-full" />
        <div className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3">
          <AtSkeleton className="h-[407px] rounded-card" />
          <AtSkeleton className="h-[407px] rounded-card" />
          <AtSkeleton className="hidden h-[407px] rounded-card lg:block" />
        </div>
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
    content = (
      <div className="grid grid-cols-1 items-start gap-[29px] xl:grid-cols-[minmax(0,1fr)_288px]">
        {/* Falló una actualización pero hay datos previos: aviso discreto y se siguen mostrando. */}
        {isError && (
          <MlFormAlert title="No pudimos actualizar tu dashboard." className="xl:col-span-2">
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
        <div aria-busy={isPending || undefined}>
          {isPending ? (
            <>
              <span className="sr-only">Cargando promociones y recomendaciones</span>
              <MainColumnSkeleton />
            </>
          ) : (
            <div className="flex flex-col gap-[27px]">
              <OrPromoCarousel slides={data.promotions} />

              <div className="grid gap-[27px] lg:grid-cols-2">
                {data.categories.map((category) => (
                  <MlPromoBanner
                    key={category.id}
                    variant="secondary"
                    title={category.title}
                    subtitle={category.subtitle}
                    imageSrc={category.imageSrc}
                    imageAlt={category.imageAlt}
                    imagePosition={category.imagePosition}
                  />
                ))}
              </div>

              {data.recommendations.length > 0 && (
                <section aria-labelledby="preferencias-titulo" className="flex flex-col gap-6">
                  <h2
                    id="preferencias-titulo"
                    className="font-display text-[28px] font-bold leading-[37px] tracking-[-0.04em] text-foreground"
                  >
                    Según tus preferencias
                  </h2>
                  <div className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3">
                    {data.recommendations.map((product) => {
                      const quantity = quantities[product.id] ?? 1;
                      return (
                        <OrProductCard
                          key={product.id}
                          className="w-full"
                          title={product.name}
                          description={product.description}
                          imageSrc={product.imageSrc}
                          imageAlt={product.imageAlt}
                          quantity={quantity}
                          onQuantityChange={(value) =>
                            setQuantities((prev) => ({ ...prev, [product.id]: value }))
                          }
                          // TODO: conectar API (T-04). Añadir al carrito cuando exista; hoy lleva a Ordenar.
                          ctaHref={`${RUTA_ORDENAR}?producto=${product.id}&cantidad=${quantity}`}
                        />
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Bajo xl la columna derecha baja debajo de la principal; en tablet se reparte en dos columnas. */}
        <aside aria-label="Tu actividad" className="grid items-start gap-[11px] md:grid-cols-2 md:gap-x-[27px] xl:grid-cols-1">
          <div className="flex flex-col gap-[14px] md:gap-[11px] xl:gap-[14px]">
            <MlGreetingCard name={user?.displayName ?? ""} isLoading={isPending} ctaHref={RUTA_ORDENAR} />
            <MlActiveOrderCard
              isLoading={isPending}
              order={data?.activeOrder ? toActiveOrderCard(data.activeOrder) : null}
            />
          </div>
          {/* TODO: conectar API (T-04). Sin `onRepeat`, "Repetir" sale deshabilitado: aún no hay carrito. */}
          <OrRecentOrders
            isLoading={isPending}
            orders={data?.recentOrders.map(toRecentOrderItem) ?? []}
            viewAllHref={RUTA_PEDIDOS}
            emptyActionHref={RUTA_ORDENAR}
            />
        </aside>
      </div>
    );
  }

  return (
    <TmAppLayout
      title="Dashboard"
      titleIcon={<LayoutGrid />}
      sidebar={{
        items: NAV_ITEMS,
        activeKey: "dashboard",
        isOpen: isSidebarOpen,
        onToggle: () => setIsSidebarOpen((open) => !open),
        homeHref: "/dashboard",
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
