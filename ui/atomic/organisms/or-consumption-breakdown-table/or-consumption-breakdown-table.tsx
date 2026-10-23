import { cn, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

import { ConsumptionBreakdownDimension } from "@/domain/types";
import { formatCaracasDateSlash } from "@/shared/utils";
import { formatPrice, formatSignedPercent } from "@/shared/utils/money";
import { MlSegmentedControl, MlSegmentedControlOption } from "@/ui/atomic/molecules";

import { OrConsumptionBreakdownTableProps } from "./or-consumption-breakdown-table.types";

const DIMENSION_LABELS: Record<ConsumptionBreakdownDimension, string> = {
  branch: "Sede",
  department: "Departamento",
  user: "Usuario",
};

const TOTAL_ROW_CLASSES = "border-t-2 border-divider font-semibold text-foreground";

/**
 * "Desglose del consumo" de Indicadores (Figma overview `3706:2856`, departamento `3707:3278`, usuario
 * `3707:3675`): 3 pestañas con columnas propias y una fila de total. La pestaña "Usuario" solo aparece para
 * `COMPANY_ADMIN`/`COMPANY_FINANCE` (UX; el back es el gate real si alguien fuerza la llamada). Las filas se
 * listan con `.map` directo en los hijos de `TableBody` (no en un subcomponente): react-aria recorre los
 * hijos como una colección y no reconoce `TableRow` envueltas en otro componente.
 */
export function OrConsumptionBreakdownTable({
  dimension,
  onDimensionChange,
  canViewUserBreakdown,
  data,
  previousMonthLabel,
  isFetching = false,
  className,
}: OrConsumptionBreakdownTableProps) {
  const options: MlSegmentedControlOption[] = [
    { value: "branch", label: DIMENSION_LABELS.branch },
    { value: "department", label: DIMENSION_LABELS.department },
    ...(canViewUserBreakdown ? [{ value: "user", label: DIMENSION_LABELS.user }] : []),
  ];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <MlSegmentedControl
        name="desglose-consumo"
        label="Ver por"
        options={options}
        value={dimension}
        onChange={(value) => onDimensionChange(value as ConsumptionBreakdownDimension)}
      />

      <div className={cn("overflow-x-auto transition-opacity duration-(--duration-fast)", isFetching && "opacity-60")}>
        {data.dimension === "branch" && (
          <Table aria-label="Consumo por sede" shadow="none" radius="lg">
            <TableHeader>
              <TableColumn>SEDE</TableColumn>
              <TableColumn>PEDIDOS</TableColumn>
              <TableColumn>COMENSALES</TableColumn>
              <TableColumn>INVERSIÓN</TableColumn>
              <TableColumn>TICKET PROM.</TableColumn>
              <TableColumn>{`VS. ${previousMonthLabel.toUpperCase()}`}</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sin pedidos este mes.">
              {[
                ...data.rows.map((row) => (
                  <TableRow key={row.branchId ?? "sin-sede"}>
                    <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                    <TableCell>{row.orders}</TableCell>
                    <TableCell>{row.dinersServed}</TableCell>
                    <TableCell>{formatPrice(row.investment)}</TableCell>
                    <TableCell>{formatPrice(row.avgTicket)}</TableCell>
                    <TableCell>{formatSignedPercent(row.changePercent)}</TableCell>
                  </TableRow>
                )),
                <TableRow key="total" className={TOTAL_ROW_CLASSES}>
                  <TableCell className="font-semibold text-foreground">Total empresa</TableCell>
                  <TableCell>{data.totals.orders}</TableCell>
                  <TableCell>{data.totals.dinersServed}</TableCell>
                  <TableCell>{formatPrice(data.totals.investment)}</TableCell>
                  <TableCell>{formatPrice(data.totals.avgTicket)}</TableCell>
                  <TableCell>{formatSignedPercent(data.totals.changePercent)}</TableCell>
                </TableRow>,
              ]}
            </TableBody>
          </Table>
        )}

        {data.dimension === "department" && (
          <Table aria-label="Consumo por departamento" shadow="none" radius="lg">
            <TableHeader>
              <TableColumn>DEPARTAMENTO</TableColumn>
              <TableColumn>SEDE PRINCIPAL</TableColumn>
              <TableColumn>PEDIDOS</TableColumn>
              <TableColumn>COMENSALES</TableColumn>
              <TableColumn>INVERSIÓN</TableColumn>
              <TableColumn>% DEL TOTAL</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sin pedidos este mes.">
              {[
                ...data.rows.map((row) => (
                  <TableRow key={row.departmentId ?? "sin-departamento"}>
                    <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                    <TableCell>{row.mainBranchName ?? "—"}</TableCell>
                    <TableCell>{row.orders}</TableCell>
                    <TableCell>{row.dinersServed}</TableCell>
                    <TableCell>{formatPrice(row.investment)}</TableCell>
                    <TableCell>{Math.round(row.percentOfTotal)}%</TableCell>
                  </TableRow>
                )),
                <TableRow key="total" className={TOTAL_ROW_CLASSES}>
                  <TableCell className="font-semibold text-foreground">Total empresa</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>{data.totals.orders}</TableCell>
                  <TableCell>{data.totals.dinersServed}</TableCell>
                  <TableCell>{formatPrice(data.totals.investment)}</TableCell>
                  <TableCell>{Math.round(data.totals.percentOfTotal)}%</TableCell>
                </TableRow>,
              ]}
            </TableBody>
          </Table>
        )}

        {data.dimension === "user" && (
          <Table aria-label="Consumo por usuario" shadow="none" radius="lg">
            <TableHeader>
              <TableColumn>USUARIO</TableColumn>
              <TableColumn>DEPARTAMENTO</TableColumn>
              <TableColumn>SEDE</TableColumn>
              <TableColumn>PEDIDOS</TableColumn>
              <TableColumn>INVERSIÓN</TableColumn>
              <TableColumn>ÚLTIMO PEDIDO</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sin pedidos este mes.">
              {data.rows.map((row) => (
                <TableRow key={row.userId}>
                  <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                  <TableCell>{row.departmentName ?? "—"}</TableCell>
                  <TableCell>{row.branchName ?? "—"}</TableCell>
                  <TableCell>{row.orders}</TableCell>
                  <TableCell>{formatPrice(row.investment)}</TableCell>
                  <TableCell>{formatCaracasDateSlash(row.lastOrderAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
