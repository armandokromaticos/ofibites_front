import { PasswordStrength } from "@/shared/utils";

export interface MlPasswordStrengthMeterProps {
  /** Resultado de `getPasswordStrength`; `null` (sin contraseña) deja las barras vacías y sin nivel. */
  strength: PasswordStrength | null;
  /** Texto a la izquierda bajo las barras. */
  label?: string;
  className?: string;
}
