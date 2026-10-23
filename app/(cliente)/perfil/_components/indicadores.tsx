"use client";

import { useMemo, useState } from "react";

import { Select, SelectItem } from "@heroui/react";
import { CloudOff, Download } from "lucide-react";

import {
  monthLabel,
  monthOptions,
  peakOrdersDayLabel,
  previousMonthLabel,
  useClientIndicators,
  useConsumptionBreakdown,
  useExportConsumption,
} from "@/domain/hooks/dashboard";
import { ConsumptionBreakdownDimension } from "@/domain/types";
import { getApiErrorMessage } from "@/shared/utils";
import { formatPrice, formatSignedPercent } from "@/shared/utils/money";
import { AtButton, AtSkeleton } from "@/ui/atomic/atoms";
import { MlBarChart, MlEmptyState, MlFormAlert, MlKpiCard, MlRankedList } from "@/ui/atomic/molecules";
import { OrConsumptionBreakdownTable } from "@/ui/atomic/organisms";

import { RUTA_PEDIDOS } from "../../_navegacion";

const SELECT_CLASSNAMES = {
  trigger: "h-9 min-h-9 w-auto min-w-[160px] bg-content1 border-small border-divider",
  value: "text-[13px] font-semibold text-foreground",
  selectorIcon: "text-muted",
};

interface IndicadoresProps {
  /** `COMPANY_ADMIN`/`COMPANY_FINANCE` de la empresa activa: solo ellos ven la pestaña "Usuario" del
   * desglose (el back es el gate real si alguien fuerza la llamada a `?dimension=user`). */
  canViewUserBreakdown: boolean;
}

/**
 * "Indicadores" de Mi perfil (T-32a/T-32b, Figma overview `3706:2856`, departamento `3707:3278`, usuario
 * `3707:3675`): 4 KPIs, selector de mes, "Pedidos por día", "Top productos del mes" y el desglose del
 * consumo por sede/departamento/usuario, con exportar a CSV. Contrato IMPLEMENTADO (T-32a); los hooks
 * (`domain/hooks/dashboard`) llaman a la API real, sin datos de ejemplo.
 */
export function Indicadores({ canViewUserBreakdown }: IndicadoresProps) {
  const options = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(options[0].value);
  const [dimension, setDimension] = useState<ConsumptionBreakdownDimension>("branch");

  const indicatorsQuery = useClientIndicators(month);
  const breakdownQuery = useConsumptionBreakdown(dimension, month);
  const exportConsumption = useExportConsumption();
  const [exportError, setExportError] = useState<string | null>(null);

  const indicators = indicatorsQuery.data;
  const ordersPerDay = indicators?.ordersPerDay ?? [];
  const peakLabel = peakOrdersDayLabel(ordersPerDay);
  const peakPoint =
    ordersPerDay.length > 0
      ? ordersPerDay.reduce((max, point) => (point.count > max.count ? point : max), ordersPerDay[0])
      : null;
  const peakDate = peakPoint?.date;

  const avgOrders = indicators?.totalOrders ?? 0;
  const avgDiners = avgOrders > 0 ? Math.round((indicators?.dinersServed ?? 0) / avgOrders) : 0;
  // El back solo da el agregado `inProgressOrders` (sin desglose por sub-estado como en el Figma, que no es
  // un dato real disponible hoy): subtítulo genérico en vez de "N programados · N en tránsito".
  const inCurso = indicators
    ? indicators.inProgressOrders > 0
      ? "Aún sin entregar"
      : "Sin pedidos en curso"
    : "";

  const puedeExportar = !exportConsumption.isPending;

  const exportar = () => {
    if (!puedeExportar) return;
    setExportError(null);
    exportConsumption.mutate(
      { dimension, month },
      { onError: (error) => setExportError(getApiErrorMessage(error, "No pudimos exportar el archivo. Inténtalo de nuevo.")) },
    );
  };

  return (
    <section
      aria-labelledby="perfil-indicadores-titulo"
      className="flex flex-col gap-6 rounded-card bg-content1 p-5 sm:p-6"
    >
      <header className="flex flex-col gap-3 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="perfil-indicadores-titulo" className="font-display text-xl font-bold leading-7 text-foreground">
            Indicadores de la empresa
          </h2>
          <p className="text-xs leading-4 text-muted">
            Consumo de tu empresa en {monthLabel(month).toLowerCase()}, con desglose por sede,
            departamento y usuario.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Select
            aria-label="Mes a consultar"
            variant="bordered"
            radius="full"
            size="sm"
            disallowEmptySelection
            selectedKeys={[month]}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value);
            }}
            classNames={SELECT_CLASSNAMES}
          >
            {options.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            ))}
          </Select>
          <AtButton
            size="sm"
            variant="bordered"
            startContent={<Download aria-hidden="true" className="size-4" />}
            isDisabled={!puedeExportar}
            isLoading={exportConsumption.isPending}
            onPress={exportar}
          >
            Exportar
          </AtButton>
        </div>
      </header>

      {exportError && <MlFormAlert title="No pudimos exportar.">{exportError}</MlFormAlert>}

      {indicatorsQuery.isPending ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          <span className="sr-only">Cargando los indicadores de tu empresa…</span>
          <AtSkeleton className="h-28 rounded-card" />
        </div>
      ) : indicatorsQuery.isError || !indicators ? (
        <MlEmptyState
          tone="error"
          headingLevel={3}
          icon={<CloudOff />}
          title="No pudimos cargar los indicadores"
          description="Puede ser un problema de conexión. Vuelve a intentarlo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => indicatorsQuery.refetch()}
          isActionLoading={indicatorsQuery.isFetching}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MlKpiCard title="Total de pedidos" value={String(indicators.totalOrders)} subtitle="Suma de todos los pedidos" />
            <MlKpiCard
              title="Pedidos en curso"
              value={String(indicators.inProgressOrders)}
              subtitle={inCurso}
              link={{ label: "Ver pedidos", href: RUTA_PEDIDOS }}
            />
            <MlKpiCard
              title="Comensales atendidos"
              value={indicators.dinersServed.toLocaleString("es-VE")}
              subtitle={`Promedio ${avgDiners} por pedido`}
            />
            <MlKpiCard
              title="Inversión del mes"
              value={formatPrice(indicators.monthInvestment)}
              subtitle={
                indicators.monthInvestmentChangePercent !== null
                  ? `${formatSignedPercent(indicators.monthInvestmentChangePercent)} vs. ${previousMonthLabel(month)}`
                  : undefined
              }
              subtitleTone={
                indicators.monthInvestmentChangePercent === null
                  ? "default"
                  : indicators.monthInvestmentChangePercent >= 0
                    ? "success"
                    : "danger"
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-3 rounded-card bg-background p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold leading-5 text-foreground">Pedidos por día</h3>
                {peakLabel && <span className="text-[10px] font-semibold leading-4 text-brand">{peakLabel}</span>}
              </div>
              <p className="text-[11px] leading-4 text-muted">
                Todas las sedes · días hábiles de {monthLabel(month).toLowerCase()}
              </p>
              {indicators.ordersPerDay.length > 0 ? (
                <MlBarChart
                  points={indicators.ordersPerDay.map((point) => ({
                    key: point.date,
                    label: point.date.slice(-2),
                    value: point.count,
                  }))}
                  highlightKey={peakDate}
                  ariaLabel={`Pedidos por día de ${monthLabel(month)}: ${indicators.ordersPerDay
                    .map((point) => `${point.date.slice(-2)}: ${point.count}`)
                    .join(", ")}`}
                />
              ) : (
                <p className="py-8 text-center text-xs text-muted">Sin pedidos este mes.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-card bg-background p-5">
              <h3 className="text-sm font-semibold leading-5 text-foreground">Top productos del mes</h3>
              <p className="text-[11px] leading-4 text-muted">Lo más pedido por toda la empresa</p>
              {indicators.topProducts.length > 0 ? (
                <MlRankedList
                  items={indicators.topProducts.map((product) => ({
                    key: product.productId,
                    label: product.name,
                    quantityLabel: `${product.quantity}×`,
                  }))}
                />
              ) : (
                <p className="py-8 text-center text-xs text-muted">Sin pedidos este mes.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold leading-5 text-foreground">Desglose del consumo</h3>
              <p className="text-[11px] leading-4 text-muted">El mismo mes visto por sede, por departamento o por usuario</p>
            </div>

            {breakdownQuery.isPending ? (
              <AtSkeleton className="h-64 rounded-card" />
            ) : breakdownQuery.isError || !breakdownQuery.data ? (
              <MlEmptyState
                tone="error"
                headingLevel={4}
                icon={<CloudOff />}
                title="No pudimos cargar el desglose"
                description="Puede ser un problema de conexión. Vuelve a intentarlo en unos segundos."
                actionLabel="Reintentar"
                onAction={() => breakdownQuery.refetch()}
                isActionLoading={breakdownQuery.isFetching}
              />
            ) : (
              <OrConsumptionBreakdownTable
                dimension={dimension}
                onDimensionChange={setDimension}
                canViewUserBreakdown={canViewUserBreakdown}
                data={breakdownQuery.data}
                previousMonthLabel={previousMonthLabel(month)}
                isFetching={breakdownQuery.isFetching}
              />
            )}
          </div>

          <p className="flex items-start gap-3 rounded-2xl bg-surface-sand/50 px-4 py-3.5 text-xs leading-[18px] text-foreground">
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            Exportar entrega el mismo corte que estés viendo, con el histórico del rango seleccionado. El
            desglose por usuario lo ven el administrador de empresa y el usuario financiero.
          </p>
        </>
      )}
    </section>
  );
}
