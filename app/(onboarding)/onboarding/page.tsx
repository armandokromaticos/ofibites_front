import { OnboardingCliente } from "./_components/onboarding-cliente";

export const metadata = { title: "Configura tu empresa · Ofibites" };

/** `/onboarding` (Figma `3503:4239`): datos de empresa → sedes → equipo → listo. */
export default function OnboardingPage() {
  return <OnboardingCliente />;
}
