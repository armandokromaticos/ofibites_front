"use client";

import Link from "next/link";

import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { MoreHorizontal } from "lucide-react";

import { ORDER_STATUS_GROUP_TONES } from "@/domain/models";
import { AtStatusChip } from "@/ui/atomic/atoms";

import { OrOrderTableProps, OrOrderTableRow } from "./or-order-table.types";

const VER_PEDIDO = "ver-pedido";

/** Viñeta del menú del Figma (punto `brand` delante de cada opción). Decorativa. */
const vineta = <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-brand" />;

function RowMenu({
  row,
  isBusy,
  onRowAction,
}: {
  row: OrOrderTableRow;
  isBusy: boolean;
  onRowAction?: OrOrderTableProps["onRowAction"];
}) {
  const actions = row.actions ?? [];
  const disabledKeys = isBusy
    ? [VER_PEDIDO, ...actions.map((action) => action.key)]
    : actions.filter((action) => action.isDisabled).map((action) => action.key);

  return (
    <Dropdown placement="bottom-end" classNames={{ content: "min-w-[230px] rounded-card p-2" }}>
      <DropdownTrigger>
        <button
          type="button"
          aria-label={`Acciones del pedido #${row.orderNumber}`}
          disabled={isBusy}
          className={cn(
            // Figma 3562:1421: píldora crema de 32 px con "···" en `primary`.
            "flex size-8 items-center justify-center rounded-full bg-background text-primary",
            "transition-colors duration-(--duration-fast) hover:bg-surface-sand aria-expanded:bg-surface-sand",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            isBusy && "opacity-50",
          )}
        >
          {isBusy ? (
            <Spinner size="sm" color="current" />
          ) : (
            <MoreHorizontal aria-hidden="true" className="size-4" strokeWidth={2.5} />
          )}
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Acciones del pedido #${row.orderNumber}`}
        disabledKeys={disabledKeys}
        itemClasses={{ base: "gap-3 px-3 py-2", title: "text-sm font-medium text-foreground" }}
        onAction={(key) => {
          const action = actions.find((item) => item.key === key);
          if (action && !action.href) onRowAction?.(row, action.key);
        }}
      >
        {[
          <DropdownItem
            key={VER_PEDIDO}
            as={Link}
            href={row.detailHref}
            textValue="Ver pedido"
            startContent={vineta}
          >
            Ver pedido
          </DropdownItem>,
          ...actions.map((action) =>
            action.href ? (
              <DropdownItem
                key={action.key}
                as={Link}
                href={action.href}
                textValue={action.label}
                startContent={vineta}
              >
                {action.label}
              </DropdownItem>
            ) : (
              <DropdownItem key={action.key} textValue={action.label} startContent={vineta}>
                {action.label}
              </DropdownItem>
            ),
          ),
        ]}
      </DropdownMenu>
    </Dropdown>
  );
}

/**
 * Tabla de "Pedidos realizados" (Figma 3562:1180): nº de pedido, fecha, departamento, usuario, tipo, monto, estado
 * de pago (PAGO, T-06: "—" sin factura) y estado del pedido, con el menú "···" por fila ("Ver pedido" siempre + las
 * `actions` que mande la página).
 *
 * Una sola card blanca de radio 15: `topContent` (filtros) arriba, cabecera crema de 38 px, filas de 60 px separadas
 * por líneas `surface-sand` y `bottomContent` (paginación) al pie. La barra y el pie quedan fuera del scroll
 * horizontal de la tabla en pantallas estrechas.
 */
const CLASSNAMES = {
  base: "gap-0 overflow-hidden rounded-[15px] bg-content1",
  wrapper: "rounded-none bg-transparent p-0 shadow-none",
  th: cn(
    "h-[38px] bg-background px-5 text-[10px] font-semibold uppercase text-muted first:rounded-none last:rounded-none",
    "border-y border-surface-sand",
  ),
  td: "h-[60px] whitespace-nowrap px-5 text-[13px] text-foreground",
  tr: "border-b border-surface-sand last:border-b-0",
  emptyWrapper: "h-auto",
};

export function OrOrderTable({
  rows,
  isLoading = false,
  onRowAction,
  busyOrderId,
  emptyContent = "No encontramos pedidos.",
  topContent,
  bottomContent,
  className,
}: OrOrderTableProps) {
  return (
    <Table
      aria-label="Pedidos realizados"
      shadow="none"
      radius="none"
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={CLASSNAMES}
      className={className}
    >
      <TableHeader>
        <TableColumn>Nº DE PEDIDO</TableColumn>
        <TableColumn>FECHA</TableColumn>
        <TableColumn>DEPARTAMENTO</TableColumn>
        <TableColumn>USUARIO</TableColumn>
        <TableColumn>TIPO DE PEDIDO</TableColumn>
        <TableColumn>MONTO TOTAL</TableColumn>
        <TableColumn>PAGO</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn width={56}>
          <span className="sr-only">Acciones</span>
        </TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando tus pedidos" />}
        emptyContent={emptyContent}
      >
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-semibold text-primary">#{row.orderNumber}</TableCell>
            <TableCell>
              {row.dateTime ? <time dateTime={row.dateTime}>{row.dateLabel}</time> : row.dateLabel}
            </TableCell>
            <TableCell>{row.departmentLabel}</TableCell>
            <TableCell>{row.userLabel}</TableCell>
            <TableCell>{row.typeLabel}</TableCell>
            <TableCell className="font-semibold text-foreground">{row.amountLabel}</TableCell>
            <TableCell>
              {row.payment ? (
                <AtStatusChip tone={row.payment.tone}>{row.payment.label}</AtStatusChip>
              ) : (
                <>
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">Sin factura</span>
                </>
              )}
            </TableCell>
            <TableCell>
              <AtStatusChip tone={ORDER_STATUS_GROUP_TONES[row.statusGroup]}>
                {row.statusLabel}
              </AtStatusChip>
            </TableCell>
            <TableCell>
              <RowMenu row={row} isBusy={busyOrderId === row.id} onRowAction={onRowAction} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
