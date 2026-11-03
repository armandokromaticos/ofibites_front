"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CloudOff } from "lucide-react";

import { useActiveCompany } from "@/domain/hooks/companies";
import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { useAuthStore } from "@/domain/stores";
import { AtSkeleton, MlAuthHeader, MlEmptyState, MlFormAlert, MlStepIndicator } from "@/ui/atomic";

import { COPY_PASO, Paso, PASO_LISTO, pasoInicial, PASOS } from "../_data/onboarding";

import { PasoEmpresa } from "./paso-empresa";
import { PasoEquipo } from "./paso-equipo";
import { PasoListo } from "./paso-listo";
import { PasoSedes } from "./paso-sedes";

/**
 * Onboarding del `COMPANY_ADMIN` de una empresa recién aprobada (T-34, Figma `3503:4239`). Obligatorio: la guarda de
 * `(cliente)` y el login traen aquí mientras `onboardingCompletedAt === null`. Aquí se sale a `/dashboard` si ya
 * está completado o si el rol no es `COMPANY_ADMIN`, salvo en «Listo» (recién completado en esta visita).
 * Al recargar se retoma el paso según los datos (`pasoInicial`).
 */
export function OnboardingCliente() {
  const router = useRouter();
  const membership = useAuthStore((state) =>
    state.memberships.find((m) => m.companyId === state.activeCompanyId),
  );
  const user = useAuthStore((state) => state.user);
  const companyQuery = useActiveCompany();
  const addressesQuery = useCompanyAddresses();

  const [pasoElegido, setPasoElegido] = useState<Paso | null>(null);
  // «Finalizar y comenzar» en curso: la sesión pasa a completada (onSuccess de la mutación) antes de que se fije
  // «Listo»; sin esto, ese render intermedio redirigiría a /dashboard.
  const [finalizando, setFinalizando] = useState(false);
  // Mensaje del 400 de complete al volver a un paso incompleto.
  const [avisoPaso, setAvisoPaso] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const pendiente = membership?.role === "COMPANY_ADMIN" && membership.onboardingCompletedAt === null;
  const finalizado = pasoElegido === PASO_LISTO;
  const debeSalir = !pendiente && !finalizado && !finalizando;

  useEffect(() => {
    if (debeSalir) router.replace("/dashboard");
  }, [debeSalir, router]);

  const company = companyQuery.data;
  const addresses = addressesQuery.data;
  // El paso de los datos se calcula una sola vez (al cargar): después manda la navegación del usuario. Si no se
  // fijara, crear la primera sede en el paso 2 movería solo al 3. setState en render: patrón admitido por React.
  const pasoDeLosDatos = company && addresses ? pasoInicial(company, addresses) : null;
  if (pasoElegido === null && pasoDeLosDatos !== null) setPasoElegido(pasoDeLosDatos);
  const paso: Paso | null = pasoElegido ?? pasoDeLosDatos;

  // Al cambiar de paso (no al cargar), el foco va al título del paso nuevo.
  const pasoAnterior = useRef<Paso | null>(null);
  useEffect(() => {
    if (paso === null) return;
    if (pasoAnterior.current !== null && pasoAnterior.current !== paso) titleRef.current?.focus();
    pasoAnterior.current = paso;
  }, [paso]);

  const irA = (destino: Paso) => {
    setAvisoPaso(null);
    setPasoElegido(destino);
  };

  const volverAPasoPendiente = async (mensaje: string): Promise<boolean> => {
    const [empresa, sedes] = await Promise.all([companyQuery.refetch(), addressesQuery.refetch()]);
    if (!empresa.data || !sedes.data) return false;
    const destino = pasoInicial(empresa.data, sedes.data);
    if (destino === 2) return false;
    setAvisoPaso(mensaje);
    setPasoElegido(destino);
    return true;
  };

  if (debeSalir) {
    return (
      <div aria-busy="true">
        <span className="sr-only">Redirigiendo…</span>
      </div>
    );
  }

  const isError = companyQuery.isError || addressesQuery.isError;

  if (paso === null || !companyQuery.data) {
    return isError ? (
      <div className="rounded-card bg-content1 px-4">
        <h1 className="sr-only">Configura tu empresa</h1>
        <MlEmptyState
          tone="error"
          headingLevel={2}
          icon={<CloudOff />}
          title="No pudimos cargar los datos de tu empresa"
          description="Puede ser un problema de conexión. Vuelve a intentarlo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => {
            void companyQuery.refetch();
            void addressesQuery.refetch();
          }}
          isActionLoading={companyQuery.isFetching || addressesQuery.isFetching}
        />
      </div>
    ) : (
      <div aria-busy="true" className="flex flex-col items-center gap-10">
        <span className="sr-only">Cargando los datos de tu empresa…</span>
        <AtSkeleton className="h-[47px] w-full rounded-full" />
        <AtSkeleton className="h-10 w-3/4 rounded-full" />
        <AtSkeleton className="h-[57px] w-full max-w-[578px] rounded-full" />
        <AtSkeleton className="h-[57px] w-full max-w-[578px] rounded-full" />
      </div>
    );
  }

  const copy = COPY_PASO[paso];

  return (
    <div className="flex flex-col gap-12">
      <MlStepIndicator steps={[...PASOS]} currentStep={paso === PASO_LISTO ? PASOS.length : paso} label="Configuración de tu empresa" />

      <div className="flex flex-col gap-[25px]">
        <MlAuthHeader title={copy.title} subtitle={copy.subtitle} titleRef={titleRef} className="[&>p]:text-balance" />

        <div className="mx-auto flex w-full max-w-[578px] flex-col gap-[25px]">
          {avisoPaso && <MlFormAlert title="Antes de terminar, completa este paso.">{avisoPaso}</MlFormAlert>}
          {paso === 0 && (
            <PasoEmpresa company={companyQuery.data} onContinue={() => irA(1)} />
          )}
          {paso === 1 && (
            <PasoSedes
              addresses={addressesQuery.data ?? []}
              isRefreshing={addressesQuery.isFetching}
              onContinue={() => irA(2)}
            />
          )}
          {paso === 2 && user && membership && (
            <PasoEquipo
              currentUserId={user.id}
              currentUserName={user.name}
              currentUserPosition={membership.position}
              onFinishStart={() => setFinalizando(true)}
              onFinished={() => irA(PASO_LISTO)}
              onFinishFailed={() => setFinalizando(false)}
              onIncomplete={volverAPasoPendiente}
            />
          )}
          {paso === PASO_LISTO && <PasoListo />}
        </div>
      </div>
    </div>
  );
}
