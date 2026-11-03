"use client";

import { FormEvent, useId, useState } from "react";

import { useUpdateCompanyFiscalData } from "@/domain/hooks/companies";
import { Company } from "@/domain/types";
import { AtButton, AtInput, MlForm, MlFormAlert } from "@/ui/atomic";

import { mensajeErrorDatosFiscales } from "../_data/onboarding";

import { useGuardaDobleClic } from "./use-guarda-doble-clic";

const MAX_DIRECCION = 500;

const CLASES_LABEL = { label: "text-base font-semibold text-placeholder" };

interface PasoEmpresaProps {
  company: Company;
  onContinue: () => void;
}

/**
 * Paso 1 (Figma `3247:12665`): razón social y RIF de solo lectura (ya los validó Ofibites) y la dirección fiscal,
 * obligatoria. `PATCH /companies/:companyId/fiscal-data` solo si la dirección cambió.
 */
export function PasoEmpresa({ company, onContinue }: PasoEmpresaProps) {
  const id = useId();
  const update = useUpdateCompanyFiscalData();
  const esDobleClic = useGuardaDobleClic();
  const [direccion, setDireccion] = useState(company.fiscalAddress ?? "");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const ayudaId = `${id}-ayuda`;

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (update.isPending || esDobleClic()) return;
    const valor = direccion.trim();
    if (!valor) {
      setError("Escribe la dirección fiscal de tu empresa.");
      event.currentTarget.querySelector<HTMLInputElement>("[name=\"fiscalAddress\"]")?.focus();
      return;
    }
    setFormError(null);
    if (valor === (company.fiscalAddress ?? "").trim()) {
      onContinue();
      return;
    }
    update
      .mutateAsync({ fiscalAddress: valor })
      .then(onContinue)
      .catch((err: unknown) => setFormError(mensajeErrorDatosFiscales(err)));
  };

  return (
    <MlForm validationBehavior="aria" onSubmit={enviar} className="w-full gap-[33px]">
      <div className="flex w-full flex-col gap-[15px]">
        {formError && <MlFormAlert title="No pudimos guardar los datos.">{formError}</MlFormAlert>}

        <div className="grid gap-[15px] sm:grid-cols-2">
          <AtInput
            name="fiscalName"
            label="Razón Social"
            labelPlacement="inside"
            value={company.fiscalName ?? company.legalName}
            isReadOnly
            classNames={CLASES_LABEL}
          />
          <AtInput
            name="taxId"
            label="RIF"
            labelPlacement="inside"
            value={company.taxId}
            isReadOnly
            classNames={CLASES_LABEL}
          />
        </div>

        <AtInput
          name="fiscalAddress"
          label="Dirección"
          labelPlacement="inside"
          autoComplete="street-address"
          aria-required="true"
          aria-describedby={ayudaId}
          value={direccion}
          onValueChange={(value) => {
            setDireccion(value);
            if (error) setError(null);
          }}
          maxLength={MAX_DIRECCION}
          isReadOnly={update.isPending}
          isInvalid={Boolean(error)}
          errorMessage={error}
          classNames={CLASES_LABEL}
        />
        <p id={ayudaId} className="-mt-1.5 px-[18px] text-[13px] leading-[18px] text-muted">
          Usa la dirección fiscal principal (la que aparece en tu RIF).
        </p>
      </div>

      <AtButton type="submit" size="lg" fullWidth isLoading={update.isPending}>
        Continuar paso 2
      </AtButton>
    </MlForm>
  );
}
