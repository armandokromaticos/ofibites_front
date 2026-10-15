import { cn } from "@heroui/react";

import { PasswordStrengthLevel } from "@/shared/utils";

import { MlPasswordStrengthMeterProps } from "./ml-password-strength-meter.types";

const SEGMENTS = [1, 2, 3, 4] as const;

const LEVELS: Record<PasswordStrengthLevel, { text: string; bar: string; label: string }> = {
  // Figma: barra y texto en accent; el texto va en secondary-600 (accent en 12 px no llega a AA).
  weak: { text: "Débil", bar: "bg-accent", label: "text-secondary-600" },
  medium: { text: "Media", bar: "bg-strength-medium", label: "text-strength-medium-foreground" },
  strong: { text: "Fuerte", bar: "bg-brand", label: "text-brand" },
};

/**
 * Medidor de seguridad de la contraseña (Figma 3339:2640 / 3236:12333 / 3339:2772): cuatro
 * segmentos de 6 px y la etiqueta "Seguridad de la contraseña · Débil|Media|Fuerte".
 * Lo visual va `aria-hidden`; una región `aria-live` anuncia el nivel solo cuando cambia.
 */
export function MlPasswordStrengthMeter({
  strength,
  label = "Seguridad de la contraseña",
  className,
}: MlPasswordStrengthMeterProps) {
  const level = strength ? LEVELS[strength.level] : null;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div aria-hidden="true" className="flex gap-2">
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              strength && segment <= strength.score ? level?.bar : "bg-border-input/25",
            )}
          />
        ))}
      </div>
      <div aria-hidden="true" className="flex items-center justify-between px-1 text-xs leading-[15px]">
        <span className="font-semibold text-placeholder">{label}</span>
        {level && <span className={cn("font-bold", level.label)}>{level.text}</span>}
      </div>
      <p className="sr-only" aria-live="polite">
        {level ? `${label}: ${level.text}` : ""}
      </p>
    </div>
  );
}
