import { cn } from "@heroui/react";

import { MlRoleGuideProps } from "./ml-role-guide.types";

/**
 * "¿Qué puede hacer cada rol?" (Figma "Añadir usuario" / "Editar usuario"): tarjeta lateral informativa, sin
 * interacción. Los textos de cada rol los decide quien la usa (no conoce `CompanyRole`): ver
 * `domain/models/company-member.model.ts` → `COMPANY_ROLE_LABELS`/`COMPANY_ROLE_DESCRIPTIONS`.
 */
export function MlRoleGuide({ items, className }: MlRoleGuideProps) {
  return (
    <div className={cn("flex h-fit flex-col gap-5 rounded-card bg-content1 p-6", className)}>
      <h2 className="font-display text-lg font-bold leading-6 text-foreground">¿Qué puede hacer cada rol?</h2>
      <dl className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-[13px] font-semibold leading-5 text-foreground">{item.label}</dt>
            <dd className="text-xs leading-[18px] text-muted">{item.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
