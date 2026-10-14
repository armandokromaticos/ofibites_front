"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

import { SelectItem } from "@heroui/react";

import { CreateCompanyRequest } from "@/domain/types";
import { AtButton, AtCheckbox, AtInput, AtInputProps, AtSelect } from "@/app/lib/atomic/atoms";
import {
  MlAuthHeader,
  MlChoiceChips,
  MlForm,
  MlFormAlert,
  MlStepIndicator,
} from "@/app/lib/atomic/molecules";

import { EMPLOYEE_RANGES, PHONE_COUNTRIES, RIF_PREFIXES } from "./or-company-request-wizard.constants";
import {
  CompanyRequestField,
  OrCompanyRequestWizardProps,
  OrCompanyRequestWizardSubmitError,
} from "./or-company-request-wizard.types";

/** Nombres de los pasos (solo para lectores de pantalla; el Figma muestra números). */
const STEP_NAMES = ["Tu empresa", "Tu contacto", "Confirma y envía"];

/** Copy literal del Figma (3244:12471 · 3346:1839 · 3346:1952). */
const STEP_COPY = [
  {
    title: "Solicita tu acceso a la plataforma",
    subtitle: "Tres pasos cortos. Revisamos tu solicitud en menos de 24 horas hábiles.",
  },
  {
    title: "Cuéntanos de ti",
    subtitle: "Usamos estos datos para confirmar tu acceso y coordinar el primer pedido.",
  },
  {
    title: "Revisa antes de enviar",
    subtitle: "Si algo no está bien, puedes corregirlo sin perder lo que ya cargaste.",
  },
];

const LAST_STEP = STEP_COPY.length - 1;

type ErrorKey = CompanyRequestField | "terms";

const STEP_FIELDS: ErrorKey[][] = [
  ["legalName", "taxId", "employeeCount"],
  ["contactName", "position", "contactEmail", "contactPhone"],
  ["terms"],
];

/** Nombre del control en el DOM, para llevarle el foco. */
const CONTROL_NAME: Record<ErrorKey, string> = {
  legalName: "legalName",
  taxId: "taxIdNumber",
  employeeCount: "employeeRange",
  contactName: "contactName",
  position: "position",
  contactEmail: "contactEmail",
  contactPhone: "phoneNumber",
  terms: "acceptTerms",
};

/** Longitudes máximas del contrato `POST /company-requests`. */
const MAX_LENGTH = {
  legalName: 200,
  taxId: 50,
  contactName: 150,
  contactEmail: 150,
  contactPhone: 50,
  position: 100,
} as const;

/** Parecido a `@IsEmail` del back: dominio con punto y TLD de al menos 2 letras (rechaza `a@b.c`). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^[\d\s().-]+$/;
const PHONE_MIN_DIGITS = 7;
const RIF_PATTERN = /^[\d\s.-]+$/;
/** "J-123456789", "j 12345678-9", "J123…": letra de prefijo + separador opcional al inicio del número. */
const RIF_LEADING_PREFIX = /^\s*([A-Za-z])\s*[-.\s]?\s*/;
const RIF_MIN_DIGITS = 6;
const RIF_MAX_DIGITS = 10;
/** Un submit que llega antes de esto tras cambiar de paso es el segundo clic de un doble clic. */
const STEP_CHANGE_GUARD_MS = 400;

interface FormValues {
  legalName: string;
  taxIdPrefix: string;
  taxIdNumber: string;
  employeeRange: string | null;
  contactName: string;
  position: string;
  contactEmail: string;
  phoneCountry: string;
  phoneNumber: string;
  acceptTerms: boolean;
}

const EMPTY_VALUES: FormValues = {
  legalName: "",
  taxIdPrefix: "J",
  taxIdNumber: "",
  employeeRange: null,
  contactName: "",
  position: "",
  contactEmail: "",
  phoneCountry: "VE",
  phoneNumber: "",
  acceptTerms: false,
};

type FieldErrors = Partial<Record<ErrorKey, string>>;

const digitsOf = (value: string) => value.replace(/\D/g, "");
const collapseSpaces = (value: string) => value.trim().replace(/\s+/g, " ");
const countryOf = (code: string) =>
  PHONE_COUNTRIES.find((country) => country.code === code) ?? PHONE_COUNTRIES[0];

/** RIF como lo muestra el Figma: `J-30123456-7` (el último dígito es el verificador). */
function formatTaxId(prefix: string, number: string): string {
  const digits = digitsOf(number);
  return `${prefix}-${digits.slice(0, -1)}-${digits.slice(-1)}`;
}

function formatPhone(values: FormValues): string {
  return `${countryOf(values.phoneCountry).dial} ${collapseSpaces(values.phoneNumber)}`;
}

function validateField(key: ErrorKey, values: FormValues): string | undefined {
  switch (key) {
    case "legalName": {
      const value = values.legalName.trim();
      if (!value) return "Escribe el nombre de la empresa.";
      if (value.length > MAX_LENGTH.legalName) return `Usa como máximo ${MAX_LENGTH.legalName} caracteres.`;
      return undefined;
    }
    case "taxId": {
      const value = values.taxIdNumber.trim();
      if (!value) return "Escribe el número de RIF.";
      if (!RIF_PATTERN.test(value)) return "Usa solo números y guiones, por ejemplo 30123456-7.";
      const digits = digitsOf(value).length;
      if (digits < RIF_MIN_DIGITS || digits > RIF_MAX_DIGITS) {
        return "Revisa el RIF: incluye el dígito verificador, por ejemplo 30123456-7.";
      }
      return undefined;
    }
    case "employeeCount":
      return undefined;
    case "contactName": {
      const value = values.contactName.trim();
      if (!value) return "Escribe tu nombre y apellido.";
      if (value.length > MAX_LENGTH.contactName) return `Usa como máximo ${MAX_LENGTH.contactName} caracteres.`;
      return undefined;
    }
    case "position":
      return values.position.trim().length > MAX_LENGTH.position
        ? `Usa como máximo ${MAX_LENGTH.position} caracteres.`
        : undefined;
    case "contactEmail": {
      const value = values.contactEmail.trim();
      if (!value) return "Escribe tu correo corporativo.";
      if (value.length > MAX_LENGTH.contactEmail) return `Usa como máximo ${MAX_LENGTH.contactEmail} caracteres.`;
      if (!EMAIL_PATTERN.test(value)) return "Escribe un correo válido, por ejemplo nombre@empresa.com.";
      return undefined;
    }
    case "contactPhone": {
      const value = values.phoneNumber.trim();
      if (!value) return "Escribe un teléfono de contacto.";
      if (!PHONE_PATTERN.test(value)) return "Usa solo números, espacios y los signos ( ) -.";
      if (digitsOf(value).length < PHONE_MIN_DIGITS) {
        return `Escribe un teléfono de al menos ${PHONE_MIN_DIGITS} dígitos.`;
      }
      if (formatPhone(values).length > MAX_LENGTH.contactPhone) return "El teléfono es demasiado largo.";
      return undefined;
    }
    case "terms":
      return values.acceptTerms
        ? undefined
        : "Para enviar la solicitud, acepta los términos de servicio y la política de privacidad.";
  }
}

function validateStep(step: number, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of STEP_FIELDS[step]) {
    const error = validateField(key, values);
    if (error) errors[key] = error;
  }
  return errors;
}

/** Payload según el contrato. La casilla de términos es solo del front y no se envía. */
function toPayload(values: FormValues): CreateCompanyRequest {
  const position = collapseSpaces(values.position);
  return {
    legalName: collapseSpaces(values.legalName),
    taxId: formatTaxId(values.taxIdPrefix, values.taxIdNumber),
    contactName: collapseSpaces(values.contactName),
    contactEmail: values.contactEmail.trim(),
    contactPhone: formatPhone(values),
    ...(position && { position }),
    ...(values.employeeRange && { employeeCount: Number(values.employeeRange) }),
  };
}

function isSubmitError(error: unknown): error is OrCompanyRequestWizardSubmitError {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

interface SummaryBlockProps {
  title: string;
  rows: { label: string; value: string }[];
  onEdit: () => void;
  isDisabled?: boolean;
}

/** Bloque del resumen (Figma 3346:1952, "Bloque"): título `brand`, "Editar" y filas etiqueta/valor. */
function SummaryBlock({ title, rows, onEdit, isDisabled }: SummaryBlockProps) {
  return (
    <section aria-label={title} className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold leading-4 text-brand">{title}</h2>
        <AtButton
          size="xs"
          variant="light"
          color="default"
          aria-label={`Editar ${title.toLowerCase()}`}
          className="-my-1.5 -mr-2 h-7 px-2 text-[13px] font-semibold text-secondary-600 data-[hover=true]:bg-surface-sand/60"
          onPress={onEdit}
          isDisabled={isDisabled}
        >
          Editar
        </AtButton>
      </div>
      <dl className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 text-[13px] font-semibold leading-4">
            <dt className="shrink-0 text-placeholder">{row.label}</dt>
            <dd className="min-w-0 break-words text-right text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Asistente de la solicitud de ingreso (Figma 3244:12471 · 3346:1839 · 3346:1952).
 * Valida cada paso antes de avanzar, lleva el foco al título del paso nuevo y protege contra
 * el doble clic (el botón submit cambia de función en el mismo sitio).
 */
export function OrCompanyRequestWizard({
  onSubmit,
  isSubmitting = false,
  footer,
}: OrCompanyRequestWizardProps) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Se entra a un paso desde "Editar" (o por un error del servidor): su botón vuelve al resumen.
  const [isEditingFromSummary, setIsEditingFromSummary] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<ErrorKey | null>(null);
  const hasMounted = useRef(false);
  const stepChangedAt = useRef(0);
  const submittingRef = useRef(false);

  const focusControl = (key: ErrorKey) => {
    const name = CONTROL_NAME[key];
    const control =
      containerRef.current?.querySelector<HTMLElement>(`[name="${name}"]:checked`) ??
      containerRef.current?.querySelector<HTMLElement>(`[name="${name}"]`);
    control?.focus();
  };

  // Al cambiar de paso, el foco va al título del paso nuevo (o al campo con el error).
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const key = pendingFocus.current;
    pendingFocus.current = null;
    if (key) {
      focusControl(key);
      return;
    }
    titleRef.current?.focus();
  }, [step]);

  const patchValues = (patch: Partial<FormValues>, errorKey: ErrorKey) => {
    const next = { ...values, ...patch };
    setValues(next);
    // Si el campo ya mostraba un error, se revalida al escribir para quitarlo en cuanto sea válido.
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: validateField(errorKey, next) }));
  };

  const update = <K extends keyof FormValues>(field: K, value: FormValues[K], errorKey: ErrorKey) =>
    patchValues({ [field]: value } as Partial<FormValues>, errorKey);

  /**
   * La ayuda del Figma pide "por ejemplo J-123456789": si el número empieza por una letra de
   * prefijo válida, la letra pasa al selector y se quita del número.
   */
  const updateTaxIdNumber = (value: string) => {
    const match = RIF_LEADING_PREFIX.exec(value);
    const prefix = match?.[1].toUpperCase();
    if (match && prefix && RIF_PREFIXES.some((item) => item.key === prefix)) {
      patchValues({ taxIdPrefix: prefix, taxIdNumber: value.slice(match[0].length) }, "taxId");
      return;
    }
    update("taxIdNumber", value, "taxId");
  };

  /**
   * El 2.º clic de un doble clic cae sobre lo que ocupa el sitio del botón en el paso nuevo
   * ("Enviar", "Atrás", "Editar", la casilla de términos): se ignora durante unos 400 ms.
   */
  const isJustAfterStepChange = () => Date.now() - stepChangedAt.current < STEP_CHANGE_GUARD_MS;

  const goToStep = (next: number) => {
    stepChangedAt.current = Date.now();
    setFormError(null);
    if (next === LAST_STEP) setIsEditingFromSummary(false);
    setStep(next);
  };

  const editFromSummary = (target: number, focusKey?: ErrorKey) => {
    pendingFocus.current = focusKey ?? null;
    setIsEditingFromSummary(true);
    goToStep(target);
  };

  /** Paso siguiente; si se viene del resumen, el primer paso posterior con errores o el resumen. */
  const nextStepAfter = (from: number) => {
    if (!isEditingFromSummary) return from + 1;
    for (let index = from + 1; index < LAST_STEP; index += 1) {
      if (Object.keys(validateStep(index, values)).length > 0) return index;
    }
    return LAST_STEP;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || submittingRef.current) return;
    if (isJustAfterStepChange()) return;

    const stepErrors = validateStep(step, values);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    const firstInvalid = STEP_FIELDS[step].find((key) => stepErrors[key]);
    if (firstInvalid) {
      focusControl(firstInvalid);
      return;
    }

    if (step < LAST_STEP) {
      goToStep(nextStepAfter(step));
      return;
    }

    // Paso 3: se revalidan los pasos anteriores por si se editó algo.
    for (let index = 0; index < LAST_STEP; index += 1) {
      const previousErrors = validateStep(index, values);
      const key = STEP_FIELDS[index].find((field) => previousErrors[field]);
      if (key) {
        setErrors((prev) => ({ ...prev, ...previousErrors }));
        editFromSummary(index, key);
        return;
      }
    }

    setFormError(null);
    submittingRef.current = true;
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      const submitError: OrCompanyRequestWizardSubmitError = isSubmitError(error)
        ? error
        : { message: "No pudimos enviar la solicitud. Inténtalo de nuevo." };
      const field = submitError.field;
      if (field) {
        setErrors((prev) => ({ ...prev, [field]: submitError.message }));
        editFromSummary(STEP_FIELDS.findIndex((fields) => fields.includes(field)), field);
        return;
      }
      setFormError(submitError.message);
    } finally {
      submittingRef.current = false;
    }
  };

  const inputProps = (
    key: Exclude<ErrorKey, "taxId" | "employeeCount" | "contactPhone" | "terms">,
    label: string,
  ): Partial<AtInputProps> => ({
    name: CONTROL_NAME[key],
    label,
    labelPlacement: "inside",
    value: values[key],
    onValueChange: (value: string) => update(key, value, key),
    isInvalid: Boolean(errors[key]),
    errorMessage: errors[key],
    maxLength: MAX_LENGTH[key],
    classNames: { label: "text-base font-semibold text-placeholder" },
  });

  const country = countryOf(values.phoneCountry);
  const employeeLabel = EMPLOYEE_RANGES.find((range) => range.value === values.employeeRange)?.label;
  const taxIdHelpId = `${id}-rif-help`;
  const phoneHelpId = `${id}-phone-help`;
  const termsErrorId = `${id}-terms-error`;
  const primaryLabel =
    step === LAST_STEP ? "Enviar solicitud" : isEditingFromSummary ? "Volver al resumen" : "Continuar";

  return (
    <div ref={containerRef} className="flex flex-col gap-12">
      <MlStepIndicator steps={STEP_NAMES} currentStep={step} label="Solicitud de ingreso" />

      <div className="flex flex-col gap-[25px]">
        <MlAuthHeader
          title={STEP_COPY[step].title}
          subtitle={STEP_COPY[step].subtitle}
          titleRef={titleRef}
        />

        <MlForm validationBehavior="aria" onSubmit={handleSubmit} className="mx-auto w-full max-w-[578px] gap-[33px]">
          {step === 0 && (
            <div className="flex w-full flex-col gap-[15px]">
              <AtInput {...inputProps("legalName", "Nombre de la empresa")} autoComplete="organization" aria-required="true" />

              <div className="flex flex-col gap-[15px]">
                <div className="flex items-start gap-3">
                  <AtSelect
                    aria-label="Tipo de RIF"
                    name="taxIdPrefix"
                    className="w-[88px] shrink-0"
                    classNames={{ popoverContent: "min-w-[220px]" }}
                    selectedKeys={[values.taxIdPrefix]}
                    disallowEmptySelection
                    renderValue={(items) => items.map((item) => item.key)}
                    onSelectionChange={(keys) => {
                      const [key] = Array.from(keys);
                      if (key) update("taxIdPrefix", String(key), "taxId");
                    }}
                  >
                    {RIF_PREFIXES.map((prefix) => (
                      <SelectItem key={prefix.key} textValue={prefix.label}>
                        {prefix.label}
                      </SelectItem>
                    ))}
                  </AtSelect>
                  <AtInput
                    name="taxIdNumber"
                    aria-label="Número de RIF"
                    placeholder="1234567"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-required="true"
                    aria-describedby={taxIdHelpId}
                    value={values.taxIdNumber}
                    onValueChange={updateTaxIdNumber}
                    isInvalid={Boolean(errors.taxId)}
                    errorMessage={errors.taxId}
                    maxLength={20}
                  />
                </div>
                <p id={taxIdHelpId} className="text-xs font-semibold leading-4 text-secondary-600">
                  Obligatorio. Tal como aparece en tu registro fiscal, por ejemplo J-123456789.
                </p>
              </div>

              <MlChoiceChips
                name="employeeRange"
                label="¿Cuántos empleados tiene la empresa?"
                options={[...EMPLOYEE_RANGES]}
                value={values.employeeRange}
                onChange={(value) => update("employeeRange", value, "employeeCount")}
                isInvalid={Boolean(errors.employeeCount)}
                errorMessage={errors.employeeCount}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <AtInput {...inputProps("contactName", "Nombre y apellido")} autoComplete="name" aria-required="true" />
                <AtInput {...inputProps("position", "Cargo en la empresa")} autoComplete="organization-title" />
              </div>
              <AtInput
                {...inputProps("contactEmail", "Correo corporativo")}
                type="email"
                autoComplete="email"
                aria-required="true"
              />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <AtSelect
                    aria-label="Código de país"
                    name="phoneCountry"
                    className="w-[129px] shrink-0"
                    classNames={{ popoverContent: "min-w-[260px]" }}
                    selectedKeys={[values.phoneCountry]}
                    disallowEmptySelection
                    renderValue={() => `${country.code} ${country.dial}`}
                    onSelectionChange={(keys) => {
                      const [key] = Array.from(keys);
                      if (key) update("phoneCountry", String(key), "contactPhone");
                    }}
                  >
                    {PHONE_COUNTRIES.map((item) => (
                      <SelectItem key={item.code} textValue={`${item.name} ${item.dial}`}>
                        {`${item.name} ${item.dial}`}
                      </SelectItem>
                    ))}
                  </AtSelect>
                  <AtInput
                    name="phoneNumber"
                    aria-label={`Teléfono (sin el código ${country.dial})`}
                    placeholder="412 000 0000"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    aria-required="true"
                    aria-describedby={phoneHelpId}
                    value={values.phoneNumber}
                    onValueChange={(value) => update("phoneNumber", value, "contactPhone")}
                    isInvalid={Boolean(errors.contactPhone)}
                    errorMessage={errors.contactPhone}
                    maxLength={30}
                  />
                </div>
                <p id={phoneHelpId} className="px-[19px] text-xs font-semibold leading-4 text-placeholder">
                  Elige el código del país. Si tu representante está fuera de Venezuela,
                  búscalo en la lista.
                </p>
              </div>
            </div>
          )}

          {step === LAST_STEP && (
            <div className="flex w-full flex-col gap-[18px]">
              <div className="flex flex-col gap-[18px] rounded-2xl bg-content1 px-[22px] py-5">
                <SummaryBlock
                  title="Tu empresa"
                  onEdit={() => !isJustAfterStepChange() && editFromSummary(0)}
                  isDisabled={isSubmitting}
                  rows={[
                    { label: "Nombre", value: collapseSpaces(values.legalName) },
                    { label: "RIF", value: formatTaxId(values.taxIdPrefix, values.taxIdNumber) },
                    { label: "Empleados", value: employeeLabel ?? "Sin indicar" },
                  ]}
                />
                <hr className="border-surface-sand" />
                <SummaryBlock
                  title="Tu contacto"
                  onEdit={() => !isJustAfterStepChange() && editFromSummary(1)}
                  isDisabled={isSubmitting}
                  rows={[
                    { label: "Nombre", value: collapseSpaces(values.contactName) },
                    { label: "Cargo", value: collapseSpaces(values.position) || "Sin indicar" },
                    { label: "Correo", value: values.contactEmail.trim() },
                    { label: "Teléfono", value: `${country.code} ${formatPhone(values)}` },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <AtCheckbox
                  name="acceptTerms"
                  isSelected={values.acceptTerms}
                  onValueChange={(checked) => {
                    // El consentimiento tiene que ser deliberado, no el 2.º clic de un doble clic.
                    if (isJustAfterStepChange()) return;
                    update("acceptTerms", checked, "terms");
                  }}
                  isInvalid={Boolean(errors.terms)}
                  aria-describedby={errors.terms ? termsErrorId : undefined}
                  isDisabled={isSubmitting}
                >
                  Acepto los términos de servicio y la política de privacidad de Ofibites.
                </AtCheckbox>
                {errors.terms && (
                  <p
                    id={termsErrorId}
                    className="flex items-center gap-2 text-[13px] font-semibold text-secondary-600 before:size-[7px] before:shrink-0 before:rounded-full before:bg-accent before:content-['']"
                  >
                    {errors.terms}
                  </p>
                )}
              </div>

              {formError && <MlFormAlert>{formError}</MlFormAlert>}
            </div>
          )}

          <div className="flex w-full gap-4">
            {step > 0 && (
              <AtButton
                type="button"
                size="lg"
                variant="bordered"
                className="h-[61px] shrink-0 border-1 border-primary px-[30px] text-primary"
                onPress={() => !isJustAfterStepChange() && goToStep(step - 1)}
                isDisabled={isSubmitting}
              >
                Atrás
              </AtButton>
            )}
            <AtButton type="submit" size="lg" className="min-w-0 flex-1" isLoading={isSubmitting}>
              {primaryLabel}
            </AtButton>
          </div>
        </MlForm>
      </div>

      {footer}
    </div>
  );
}
