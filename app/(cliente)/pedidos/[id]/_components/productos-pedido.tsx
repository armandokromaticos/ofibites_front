"use client";

import { cn, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

import { OrderItem } from "@/domain/types";
import { formatPrice } from "@/shared/utils";

import { conteoPedido } from "../../../_data/resumen-pedido";
import {
  conteoCajasComplementos,
  extrasLinea,
  pistaCajas,
  subtituloLinea,
  tituloLinea,
} from "../../_data/lineas-pedido";

const CLASE_TITULO_BLOQUE = "font-display text-xl font-bold leading-7 text-foreground";

// Figma 3632:1686: cabecera sin fondo (10 px), filas de 63 px separadas por una línea `track` (no sobre la primera) e
// importes a la derecha.
const CLASES_TABLA = {
  th: cn(
    "h-8 bg-transparent px-0 text-[10px] font-semibold text-foreground first:rounded-none last:rounded-none",
    "[&:not(:first-child)]:pl-4 [&:not(:first-child)]:text-right",
  ),
  td: cn(
    "h-[63px] border-track px-0 py-2.5 text-[13px] [&:not(:first-child)]:pl-4 [&:not(:first-child)]:text-right",
    "[tr:not([data-first=true])>&]:border-t",
  ),
};

interface TablaLineasProps {
  /** Nombre accesible de la tabla. */
  label: string;
  /** Etiqueta del grupo en `brand` ("CAJAS DEL PEDIDO") y su pista ("una caja por persona"). */
  grupo?: string;
  pista?: string | null;
  columnaPrecio: string;
  columnaCantidad: string;
  lineas: OrderItem[];
  todas: OrderItem[];
}

function TablaLineas(props: TablaLineasProps) {
  const { label, grupo, pista, columnaPrecio, columnaCantidad, lineas, todas } = props;
  return (
    <div className="flex flex-col gap-1.5">
      {grupo && (
        <p className="flex flex-wrap items-baseline gap-x-2.5 text-[10px] leading-4">
          <span className="font-semibold uppercase text-brand">{grupo}</span>
          {pista && <span className="text-[11px] text-muted">{pista}</span>}
        </p>
      )}
      <Table aria-label={label} shadow="none" radius="none" removeWrapper classNames={CLASES_TABLA}>
        <TableHeader>
          <TableColumn>PRODUCTO</TableColumn>
          <TableColumn>{columnaPrecio}</TableColumn>
          <TableColumn>{columnaCantidad}</TableColumn>
          <TableColumn>TOTAL</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Sin productos.">
          {lineas.map((item) => {
            const subtitulo = subtituloLinea(item);
            const extras = extrasLinea(item);
            return (
              <TableRow key={item.id}>
                <TableCell className="max-w-0 w-full">
                  <span className="block font-semibold text-foreground">{tituloLinea(item, todas)}</span>
                  {subtitulo && (
                    <span title={subtitulo} className="block truncate text-xs leading-[18px] text-muted">
                      {subtitulo}
                    </span>
                  )}
                  {extras && <span className="block truncate text-xs leading-[18px] text-muted">{extras}</span>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-ghost-foreground">
                  {item.unitPrice !== null ? formatPrice(item.unitPrice) : "—"}
                </TableCell>
                <TableCell className="font-semibold text-foreground">{item.quantity}</TableCell>
                <TableCell className="whitespace-nowrap font-semibold text-foreground">
                  {item.subtotal !== null ? formatPrice(item.subtotal) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface ProductosPedidoProps {
  items: OrderItem[];
  /** `Order.diners` del back. */
  diners: number | null;
}

/**
 * "Productos del pedido" (Figma 3632:1686): cajas (tamaños con `servings`) y complementos en dos tablas, con
 * "Para 40 personas · 40 cajas + 3 complementos". Un pedido sin cajas va en una sola tabla con "4 productos · 51
 * unidades".
 */
export function ProductosPedido({ items, diners }: ProductosPedidoProps) {
  const cajas = items.filter((item) => item.kind === "box");
  const complementos = items.filter((item) => item.kind !== "box");
  const unidades = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section aria-labelledby="pedido-productos-titulo" className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="pedido-productos-titulo" className={CLASE_TITULO_BLOQUE}>
          Productos del pedido
        </h2>
        <p className="text-xs text-muted">
          {cajas.length ? conteoCajasComplementos(items, diners) : conteoPedido(items.length, unidades)}
        </p>
      </div>
      {cajas.length ? (
        <div className="flex flex-col gap-5">
          <TablaLineas
            label="Cajas del pedido"
            grupo="Cajas del pedido"
            pista={pistaCajas(cajas.map((item) => item.servings))}
            columnaPrecio="PRECIO POR CAJA"
            columnaCantidad="CAJAS"
            lineas={cajas}
            todas={items}
          />
          {complementos.length > 0 && (
            <div className="border-t border-track pt-4">
              <TablaLineas
                label="Complementos"
                grupo="Complementos"
                pista="se suman a las cajas, no las reemplazan"
                columnaPrecio="PRECIO UNIT."
                columnaCantidad="UNIDADES"
                lineas={complementos}
                todas={items}
              />
            </div>
          )}
        </div>
      ) : (
        <TablaLineas
          label="Productos del pedido"
          columnaPrecio="PRECIO UNIT."
          columnaCantidad="CANTIDAD"
          lineas={items}
          todas={items}
        />
      )}
    </section>
  );
}
