import { PasswordRuleResult } from "@/shared/utils";

export interface MlPasswordChecklistProps {
  /** Resultado de `checkPasswordRules`, en el orden en que se pintan (dos columnas, por filas). */
  rules: PasswordRuleResult[];
  /**
   * `false` (contraseña vacía): todas las reglas en neutro, sin marcar ninguna como incumplida.
   * Por defecto `true`.
   */
  showStatus?: boolean;
  id?: string;
  className?: string;
}
