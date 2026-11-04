"use client";

import { FormEvent, useEffect, useId, useRef } from "react";

import { cn } from "@heroui/react";
import { TicketPercent } from "lucide-react";

import { AtButton, AtChip, AtInput } from "@/ui/atomic/atoms";

import { MlCouponFieldProps } from "./ml-coupon-field.types";

const PORCENTAJE = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

/** "−10 %" (signo menos tipográfico y espacio no separable: el "%" no se queda solo en otra línea). */
function porcentaje(value: number): string {
  return `−${PORCENTAJE.format(value)} %`;
}

export function MlCouponField({
  value,
  onChange,
  onApply,
  isApplying = false,
  error,
  applied,
  onRemove,
  isRemoving = false,
  className,
}: MlCouponFieldProps) {
  const errorId = useId();
  const avisoId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const quitarRef = useRef<HTMLButtonElement>(null);
  // Solo se mueve el foco tras una acción de esta persona: si otro comprador cambia el cupón del carrito compartido,
  // la caché se actualiza sin robarle el foco a nadie.
  const moverFoco = useRef(false);
  // Región viva escrita en el DOM desde el efecto (no es estado de React: no re-renderiza).
  const anuncioRef = useRef<HTMLParagraphElement>(null);
  const codigoAplicado = applied?.code ?? null;

  useEffect(() => {
    if (!moverFoco.current) return;
    moverFoco.current = false;
    (codigoAplicado ? quitarRef : inputRef).current?.focus();
    if (anuncioRef.current) {
      anuncioRef.current.textContent = codigoAplicado
        ? `Código ${codigoAplicado} aplicado.`
        : "Código quitado.";
    }
  }, [codigoAplicado]);

  // Un error del servidor cierra la acción: el foco vuelve al control (el botón con `isLoading` se deshabilita y lo
  // pierde) y no queda pendiente para un cambio posterior de otra persona.
  useEffect(() => {
    if (!error || !moverFoco.current) return;
    moverFoco.current = false;
    (codigoAplicado ? quitarRef : inputRef).current?.focus();
  }, [error, codigoAplicado]);

  const codigo = value.trim();

  const aplicar = (event: FormEvent) => {
    event.preventDefault();
    if (!codigo || isApplying) return;
    moverFoco.current = true;
    if (anuncioRef.current) anuncioRef.current.textContent = "";
    onApply(codigo);
  };

  const quitar = () => {
    moverFoco.current = true;
    if (anuncioRef.current) anuncioRef.current.textContent = "";
    onRemove();
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {applied ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex min-h-[37px] items-center gap-2">
            <AtChip
              startContent={
                <TicketPercent aria-hidden="true" className="size-3.5" />
              }
              classNames={{
                base: "h-[26px] gap-1 px-2.5",
                content: "text-xs font-semibold tracking-wide",
              }}
            >
              {applied.code}
            </AtChip>
            {applied.isValid && (
              <span className="text-[13px] font-semibold text-secondary-600">
                {porcentaje(applied.discountPercent)}
              </span>
            )}
            <AtButton
              ref={quitarRef}
              size="xs"
              variant="light"
              className="ml-auto px-2.5 text-ghost-foreground"
              aria-label={`Quitar el código ${applied.code}`}
              aria-describedby={applied.isValid ? undefined : avisoId}
              onPress={quitar}
              isLoading={isRemoving}
            >
              Quitar
            </AtButton>
          </div>
          {!applied.isValid && (
            <p id={avisoId} className="text-xs leading-5 text-danger-700">
              Este código ya no está vigente.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={aplicar} noValidate className="flex items-start gap-2">
          <AtInput
            ref={inputRef}
            aria-label="Código promocional"
            placeholder="Código promocional"
            value={value}
            onValueChange={onChange}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck="false"
            isInvalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            classNames={{
              base: "min-w-0 flex-1",
              inputWrapper: "h-[37px] bg-content1 px-4",
              input: "text-[13px] font-medium",
            }}
          />
          <AtButton
            type="submit"
            size="md"
            variant="bordered"
            color="default"
            className="shrink-0 border-1 border-primary px-4 text-primary"
            isDisabled={!codigo}
            isLoading={isApplying}
          >
            Aplicar
          </AtButton>
        </form>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="px-1 text-xs leading-5 text-danger-700"
        >
          {error}
        </p>
      )}
      <p ref={anuncioRef} aria-live="polite" className="sr-only" />
    </div>
  );
}
