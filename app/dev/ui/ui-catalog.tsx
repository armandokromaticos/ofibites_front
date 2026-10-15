"use client";

import { ReactNode, useState } from "react";

import { Bell, ClipboardList, LayoutGrid, ShoppingCart, Truck } from "lucide-react";

import { checkPasswordRules, getPasswordStrength } from "@/shared/utils";
import {
  AtIconButton,
  AtPasswordToggle,
  AtProgress,
  AtSkeleton,
  AtTextLink,
  MlActiveOrderCard,
  MlEmptyState,
  MlGreetingCard,
  MlOrderRow,
  MlPasswordChecklist,
  MlPasswordStrengthMeter,
  MlPromoBanner,
  MlQuantityStepper,
  OrAppSidebar,
  OrNewPasswordForm,
  OrProductCard,
  OrPromoCarousel,
  OrRecentOrders,
  TmAppLayout,
} from "@/app/lib/atomic";

import {
  SAMPLE_ACTIVE_ORDER,
  SAMPLE_MAIN_BANNER,
  SAMPLE_NAV_ITEMS,
  SAMPLE_ORDERS,
  SAMPLE_PRODUCT,
  SAMPLE_PROMO_SLIDES,
  SAMPLE_SECONDARY_BANNER,
  SAMPLE_USER,
} from "./catalog-data";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-4">
      <h2 id={`${id}-title`} className="font-display text-[28px] font-bold tracking-[-0.04em] text-brand">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">{children}</div>
      <figcaption className="text-xs font-medium text-muted">{label}</figcaption>
    </figure>
  );
}

function StepperDemo({ initial, min, max }: { initial: number; min: number; max: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div className="w-[254px]">
      <MlQuantityStepper value={value} onChange={setValue} min={min} max={max} />
    </div>
  );
}

function ProductCardDemo({ isHovered }: { isHovered?: boolean }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <OrProductCard
      {...SAMPLE_PRODUCT}
      quantity={quantity}
      onQuantityChange={setQuantity}
      maxQuantity={20}
      isHovered={isHovered}
    />
  );
}

const PASSWORD_SAMPLES = ["", "ofibites", "Ofibites2026", "Ofibit3#", "Ofibites2026#"];

const ACTIVE_VARIANTS: { label: string; key?: string }[] = [
  { label: "Dashboard", key: "dashboard" },
  { label: "Ordenar", key: "ordenar" },
  { label: "Pedidos", key: "pedidos" },
  { label: "Administración", key: "administracion" },
  { label: "Sin selección" },
];

export function UiCatalog() {
  const [isLayoutSidebarOpen, setLayoutSidebarOpen] = useState(false);
  const [isOpenDemoOpen, setOpenDemoOpen] = useState(true);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[41px] font-black leading-[55px] tracking-[-0.04em] text-brand">
          Catálogo de componentes
        </h1>
        <p className="text-sm font-semibold text-muted">
          Solo en desarrollo (T-02). Datos de ejemplo; en producción esta ruta responde 404.
        </p>
      </header>

      <Section id="icon-button" title="AtIconButton">
        <div className="flex flex-wrap gap-8 rounded-card bg-content1 p-6">
          <Specimen label="Sin badge">
            <AtIconButton aria-label="Carrito">
              <ShoppingCart aria-hidden="true" />
            </AtIconButton>
            <AtIconButton aria-label="Notificaciones">
              <Bell aria-hidden="true" />
            </AtIconButton>
          </Specimen>
          <Specimen label="Con badge">
            <AtIconButton aria-label="Carrito, 3 productos" badgeContent={3}>
              <ShoppingCart aria-hidden="true" />
            </AtIconButton>
            <AtIconButton aria-label="Notificaciones, 12 sin leer" badgeContent={12}>
              <Bell aria-hidden="true" />
            </AtIconButton>
          </Specimen>
          <Specimen label="Deshabilitado">
            <AtIconButton aria-label="Carrito" isDisabled>
              <ShoppingCart aria-hidden="true" />
            </AtIconButton>
          </Specimen>
        </div>
      </Section>

      <Section id="progress" title="AtProgress">
        <div className="flex max-w-[320px] flex-col gap-6 rounded-card bg-content1 p-6">
          <AtProgress aria-label="Progreso del pedido" value={0} />
          <AtProgress aria-label="Progreso del pedido" value={50} />
          <AtProgress aria-label="Progreso del pedido" value={100} />
          <AtProgress label="Pedido en curso" value={54} showValueLabel />
        </div>
      </Section>

      <Section id="stepper" title="MlQuantityStepper">
        <div className="flex flex-wrap gap-8 rounded-card bg-content1 p-6">
          <Specimen label="En el mínimo (1)">
            <StepperDemo initial={1} min={1} max={10} />
          </Specimen>
          <Specimen label="En medio (5)">
            <StepperDemo initial={5} min={1} max={10} />
          </Specimen>
          <Specimen label="En el máximo (10)">
            <StepperDemo initial={10} min={1} max={10} />
          </Specimen>
        </div>
      </Section>

      <Section id="text-link" title="AtTextLink · AtPasswordToggle">
        <div className="flex flex-wrap items-center gap-8 rounded-card bg-background p-6">
          <Specimen label="AtTextLink (hereda tamaño y color del contenedor)">
            <p className="text-base font-semibold text-placeholder">
              <AtTextLink href="/login">Volver al inicio de sesión</AtTextLink>
            </p>
          </Specimen>
          <Specimen label="AtPasswordToggle oculta / visible">
            <AtPasswordToggle aria-label="Mostrar contraseña" isVisible={false} />
            <AtPasswordToggle aria-label="Mostrar contraseña" isVisible />
          </Specimen>
        </div>
      </Section>

      <Section id="password" title="MlPasswordStrengthMeter · MlPasswordChecklist · OrNewPasswordForm">
        <div className="grid gap-6 rounded-card bg-background p-6 lg:grid-cols-2">
          {PASSWORD_SAMPLES.map((sample) => (
            <Specimen key={sample || "vacía"} label={sample ? `"${sample}"` : "Vacía"}>
              <div className="flex w-full max-w-[502px] flex-col gap-[14px]">
                <MlPasswordStrengthMeter strength={getPasswordStrength(sample)} />
                <MlPasswordChecklist rules={checkPasswordRules(sample)} showStatus={sample !== ""} />
              </div>
            </Specimen>
          ))}
        </div>
        <div className="max-w-[550px] rounded-card bg-background p-6">
          <OrNewPasswordForm onSubmit={() => undefined} />
        </div>
      </Section>

      <Section id="product-card" title="OrProductCard">
        <div className="flex flex-wrap gap-[27px]">
          <Specimen label="Default">
            <ProductCardDemo />
          </Specimen>
          <Specimen label="Hover (forzado)">
            <ProductCardDemo isHovered />
          </Specimen>
        </div>
      </Section>

      <Section id="promo-banner" title="MlPromoBanner">
        <Specimen label="Principal (main)">
          <MlPromoBanner {...SAMPLE_MAIN_BANNER} />
        </Specimen>
        <div className="grid gap-[29px] lg:grid-cols-2">
          <Specimen label="Secundario (imagen al inicio)">
            <MlPromoBanner variant="secondary" {...SAMPLE_SECONDARY_BANNER} />
          </Specimen>
          <Specimen label="Secundario con CTA (imagen al final)">
            <MlPromoBanner
              variant="secondary"
              imagePosition="end"
              ctaLabel="Ver bebidas"
              {...SAMPLE_SECONDARY_BANNER}
            />
          </Specimen>
        </div>
      </Section>

      <Section id="skeleton" title="AtSkeleton">
        <div className="flex max-w-[320px] flex-col gap-3 rounded-card bg-content1 p-6">
          <AtSkeleton className="h-6 w-40 rounded-full" />
          <AtSkeleton className="h-3 w-full rounded-full" />
          <AtSkeleton className="h-[120px] rounded-card" />
        </div>
      </Section>

      <Section id="empty-state" title="MlEmptyState">
        <div className="grid gap-6 lg:grid-cols-2">
          <Specimen label="Vacío (md)">
            <div className="rounded-card bg-content1">
              <MlEmptyState
                icon={<ClipboardList />}
                title="Todavía no has hecho ningún pedido"
                description="Arma el próximo coffee break de tu equipo en menos de dos minutos."
                actionLabel="Hacer mi primer pedido"
                onAction={() => {}}
              />
            </div>
          </Specimen>
          <Specimen label="Error con reintento">
            <div className="rounded-card bg-content1">
              <MlEmptyState
                tone="error"
                title="No pudimos cargar tu dashboard"
                description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
                actionLabel="Reintentar"
                onAction={() => {}}
              />
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="greeting-card" title="MlGreetingCard">
        <div className="flex flex-wrap items-start gap-6">
          <Specimen label="Con datos">
            <MlGreetingCard name="María Gabriela" onCtaPress={() => {}} className="w-[288px]" />
          </Specimen>
          <Specimen label="Cargando">
            <MlGreetingCard name="" isLoading onCtaPress={() => {}} className="w-[288px]" />
          </Specimen>
        </div>
      </Section>

      <Section id="order-row" title="MlOrderRow">
        <div className="flex flex-wrap items-start gap-6">
          <Specimen label="Repetir sin acción (deshabilitado)">
            <div className="w-[288px] rounded-card bg-content1 p-[15px]">
              <MlOrderRow {...SAMPLE_ORDERS[0]} detailHref="/dev/ui#order-row" />
            </div>
          </Specimen>
          <Specimen label="Repetir con acción, estado con icono">
            <div className="w-[288px] rounded-card bg-content1 p-[15px]">
              <MlOrderRow
                {...SAMPLE_ORDERS[1]}
                statusLabel="En camino"
                statusIcon={<Truck aria-hidden="true" className="size-3" />}
                onRepeat={() => {}}
                onDetail={() => {}}
              />
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="active-order" title="MlActiveOrderCard">
        <div className="flex flex-wrap items-start gap-6">
          <Specimen label="Con pedido">
            <MlActiveOrderCard order={SAMPLE_ACTIVE_ORDER} className="w-[288px]" />
          </Specimen>
          <Specimen label="Sin pedido">
            <MlActiveOrderCard order={null} className="w-[288px]" />
          </Specimen>
          <Specimen label="Cargando">
            <MlActiveOrderCard order={null} isLoading className="w-[288px]" />
          </Specimen>
        </div>
      </Section>

      <Section id="recent-orders" title="OrRecentOrders">
        <div className="flex flex-wrap items-start gap-6">
          <Specimen label="Con órdenes">
            <OrRecentOrders orders={SAMPLE_ORDERS} viewAllHref="/dev/ui#recent-orders" className="w-[288px]" />
          </Specimen>
          <Specimen label="Vacío">
            <OrRecentOrders orders={[]} emptyActionHref="/dev/ui#recent-orders" className="w-[288px]" />
          </Specimen>
          <Specimen label="Cargando">
            <OrRecentOrders orders={[]} isLoading className="w-[288px]" />
          </Specimen>
        </div>
      </Section>

      <Section id="promo-carousel" title="OrPromoCarousel">
        <OrPromoCarousel slides={SAMPLE_PROMO_SLIDES} />
      </Section>

      <Section id="sidebar" title="OrAppSidebar">
        <div className="flex flex-wrap items-start gap-6">
          <Specimen label="Abierto (236 px)">
            <div className="h-[666px]">
              <OrAppSidebar
                items={SAMPLE_NAV_ITEMS}
                activeKey="ordenar"
                isOpen={isOpenDemoOpen}
                onToggle={() => setOpenDemoOpen((open) => !open)}
                user={SAMPLE_USER}
                homeHref="/dev/ui"
                navId="sidebar-demo-open"
                logoTransitionName={null}
              />
            </div>
          </Specimen>
          {ACTIVE_VARIANTS.map((variant) => (
            <Specimen key={variant.label} label={`Cerrado · ${variant.label}`}>
              <div className="h-[666px]">
                <OrAppSidebar
                  items={SAMPLE_NAV_ITEMS}
                  activeKey={variant.key}
                  isOpen={false}
                  onToggle={() => undefined}
                  user={SAMPLE_USER}
                  homeHref="/dev/ui"
                  navId={`sidebar-demo-${variant.key ?? "none"}`}
                  logoTransitionName={null}
                />
              </div>
            </Specimen>
          ))}
        </div>
      </Section>

      <Section id="layout" title="TmAppLayout">
        <div className="overflow-hidden rounded-card border border-border-subtle">
          <TmAppLayout
            className="h-[760px]"
            sidebar={{
              items: SAMPLE_NAV_ITEMS,
              activeKey: "dashboard",
              isOpen: isLayoutSidebarOpen,
              onToggle: () => setLayoutSidebarOpen((open) => !open),
              user: SAMPLE_USER,
              homeHref: "/dev/ui",
              navId: "sidebar-demo-layout",
            }}
            title="Dashboard"
            titleIcon={<LayoutGrid />}
            cart={{ href: "/dev/ui#layout", count: 3 }}
            notifications={{ onPress: () => undefined, count: 2 }}
          >
            <div className="flex flex-col gap-[27px]">
              <MlPromoBanner {...SAMPLE_MAIN_BANNER} />
              <div className="flex flex-wrap gap-[27px]">
                <ProductCardDemo />
                <div className="flex w-[295px] flex-col gap-3 rounded-card bg-content1 p-[22px]">
                  <h2 className="text-base font-bold leading-[26px]">Pedido en curso</h2>
                  <p className="text-[11px] text-subtle">Pedido #1024 · Calle 72, oficina 301</p>
                  <AtProgress aria-label="Progreso del pedido en curso" value={54} />
                </div>
              </div>
            </div>
          </TmAppLayout>
        </div>
      </Section>
    </div>
  );
}
