"use client";

import Link from "next/link";

import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

import { ORDER_STATUS_GROUP_COLORS } from "@/domain/models";
import { AtButton, AtChip } from "@/ui/atomic/atoms";

import { OrOrderTableProps } from "./or-order-table.types";

/**
 * Tabla de "Pedidos realizados" (Figma 3562:1180), sin la columna "Pago" (estado de pago, T-06 fuera de
 * alcance): nº de pedido, fecha, departamento, usuario, tipo, monto y estado del pedido.
 */
export function OrOrderTable({ rows, isLoading = false, className }: OrOrderTableProps) {
  return (
    <Table aria-label="Pedidos realizados" shadow="none" radius="lg" className={className}>
      <TableHeader>
        <TableColumn>Nº DE PEDIDO</TableColumn>
        <TableColumn>FECHA</TableColumn>
        <TableColumn>DEPARTAMENTO</TableColumn>
        <TableColumn>USUARIO</TableColumn>
        <TableColumn>TIPO DE PEDIDO</TableColumn>
        <TableColumn>MONTO TOTAL</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn width={110}> </TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando tus pedidos" />}
        emptyContent="No encontramos pedidos."
      >
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-semibold text-foreground">#{row.orderNumber}</TableCell>
            <TableCell>
              {row.dateTime ? <time dateTime={row.dateTime}>{row.dateLabel}</time> : row.dateLabel}
            </TableCell>
            <TableCell>{row.departmentLabel}</TableCell>
            <TableCell>{row.userLabel}</TableCell>
            <TableCell>{row.typeLabel}</TableCell>
            <TableCell className="font-semibold text-foreground">{row.amountLabel}</TableCell>
            <TableCell>
              <AtChip size="sm" variant="flat" color={ORDER_STATUS_GROUP_COLORS[row.statusGroup]}>
                {row.statusLabel}
              </AtChip>
            </TableCell>
            <TableCell>
              <AtButton
                as={Link}
                href={row.detailHref}
                size="xs"
                variant="light"
                color="default"
                className="text-ghost-foreground"
                aria-label={`Ver pedido #${row.orderNumber}`}
              >
                Ver pedido
              </AtButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
