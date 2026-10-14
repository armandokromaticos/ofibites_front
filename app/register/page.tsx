"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useCreateCompanyRequest } from "@/domain/hooks/company-requests";
import { CompanyRequestResponse, CreateCompanyRequest } from "@/domain/types";
import { getApiErrorMessage, getApiErrorMessages, isApiError } from "@/shared/utils";
import {
  CompanyRequestField,
  MlAuthHeader,
  OrCompanyRequestWizard,
  OrCompanyRequestWizardSubmitError,
  TmAuthLayout,
} from "@/app/lib/atomic";

const LINK_CLASSES =
  "rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const RIF_CONFLICT_PREFIX = "Ya existe una empresa registrada con el RIF";

/**
 * Mensajes en español para los 400 de class-validator, que llegan en inglés y empiezan por el
 * nombre de la propiedad ("contactEmail must be an email"). El orden es el de los pasos.
 */
const FIELD_400_MESSAGES: Record<CompanyRequestField, string> = {
  legalName: "Revisa el nombre de la empresa: es obligatorio y admite hasta 200 caracteres.",
  taxId: "Revisa el RIF: es obligatorio y admite hasta 50 caracteres.",
  employeeCount: "Elige uno de los rangos de empleados.",
  contactName: "Revisa el nombre: es obligatorio y admite hasta 150 caracteres.",
  contactEmail: "Escribe un correo válido, por ejemplo nombre@empresa.com.",
  contactPhone: "Revisa el teléfono: es obligatorio y admite hasta 50 caracteres.",
  position: "Revisa el cargo: admite hasta 100 caracteres.",
  generalNeed: "Revisa la necesidad general: es obligatoria y admite hasta 500 caracteres.",
  interestedSolutions: "Elige al menos una de las soluciones de la lista.",
  orderFrequency: "Elige una de las frecuencias de pedido.",
  peoplePerOrder: "Elige uno de los rangos de personas por pedido.",
  additionalComments: "Revisa los comentarios: admiten hasta 1000 caracteres.",
};

/**
 * ¿El mensaje de class-validator es de esta propiedad? Casi todos empiezan por el nombre
 * ("generalNeed should not be empty"), pero los de arrays no: "each value in interestedSolutions
 * must be one of…" o "All interestedSolutions's elements must be unique".
 */
function mentionsField(text: string, field: CompanyRequestField): boolean {
  return new RegExp(`(^|\\s)${field}('s)?(\\s|$)`).test(text);
}

/**
 * Traduce el error de `POST /company-requests` al formato del asistente (contrato en
 * gestion/CONTRATOS-API.md):
 * - 409 por RIF: tal cual, en el campo RIF del paso 1.
 * - 400 de class-validator: en español, en el primer campo afectado (el asistente vuelve a su paso).
 * - Resto (409 de solicitud aprobada, red, 5xx): alerta en el paso 4 (resumen), con `getApiErrorMessage`.
 */
function toWizardError(error: unknown): OrCompanyRequestWizardSubmitError {
  const message = getApiErrorMessage(error, "No pudimos enviar la solicitud. Inténtalo de nuevo.");
  if (!isApiError(error)) return { message };

  if (error.statusCode === 409 && message.startsWith(RIF_CONFLICT_PREFIX)) {
    return { message, field: "taxId" };
  }
  if (error.statusCode === 400) {
    const raw = getApiErrorMessages(error);
    const fields = Object.keys(FIELD_400_MESSAGES) as CompanyRequestField[];
    const field = fields.find((name) => raw.some((text) => mentionsField(text, name)));
    if (field) return { message: FIELD_400_MESSAGES[field], field };
    return { message: "Algún dato no es válido. Revisa la solicitud e inténtalo de nuevo." };
  }
  return { message };
}

function RequestSent({ request }: { request: CompanyRequestResponse }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // El asistente desaparece al enviar: el foco pasa al título del mensaje de éxito.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Decisión del usuario (T-03): sin número de solicitud ("SOL-2026-0412"): el back no tiene folio legible.
  const nextSteps = [
    "Validaremos el RIF y los datos de tu empresa. Toma menos de 24 horas hábiles.",
    `Te escribiremos a ${request.contactEmail} con tus credenciales de acceso.`,
    "Entras, armas tu primer pedido y coordinamos la entrega.",
  ];

  return (
    <div className="mx-auto flex w-full max-w-[578px] flex-col items-center">
      <MlAuthHeader
        title="¡Solicitud enviada!"
        titleRef={titleRef}
        className="gap-2.5"
        icon={
          <Image
            src="/images/auth/tarta-chocolate.webp"
            alt=""
            aria-hidden="true"
            width={66}
            height={66}
            className="mb-2.5"
          />
        }
        subtitle={
          <>
            Recibimos los datos de <span className="text-secondary-600">{request.legalName}</span>
            {/* Sin doble punto cuando el nombre ya termina en "." (p. ej. "C.A."). */}
            {request.legalName.trim().endsWith(".") ? "" : "."}
          </>
        }
      />

      <section aria-labelledby="que-sigue" className="mt-7 flex w-full flex-col gap-[22px]">
        <h2 id="que-sigue" className="text-center text-base font-semibold leading-[22px] text-foreground">
          Qué sigue
        </h2>
        <ol className="flex flex-col gap-[7px]">
          {nextSteps.map((text, index) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl bg-content1 px-[22px] py-5">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-primary"
              >
                {index + 1}
              </span>
              <p className="min-w-0 break-words pt-0.5 text-[13px] font-semibold leading-[19px] text-foreground">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-[42px] text-center text-[13px] font-semibold text-placeholder">
        ¿Tienes dudas? Escríbenos a{" "}
        <a href="mailto:hola@ofibites.com" className={LINK_CLASSES}>
          hola@ofibites.com
        </a>
      </p>
      <p className="mt-3 text-center text-[13px] font-semibold text-placeholder">
        <Link href="/login" className={LINK_CLASSES}>
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const { mutateAsync, isPending, data } = useCreateCompanyRequest();

  const handleSubmit = async (payload: CreateCompanyRequest) => {
    try {
      await mutateAsync(payload);
    } catch (error) {
      throw toWizardError(error);
    }
  };

  return (
    <TmAuthLayout variant="centered" showLogo={!data}>
      {data ? (
        <RequestSent request={data} />
      ) : (
        <OrCompanyRequestWizard
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          footer={
            <p className="text-center text-[13px] font-semibold text-placeholder">
              ¿Tu empresa ya tiene cuenta?{" "}
              <Link href="/login" className={LINK_CLASSES}>
                Inicia sesión
              </Link>
            </p>
          }
        />
      )}
    </TmAuthLayout>
  );
}
