/**
 * Reglas de contraseña de OfiBites (checklist del Figma 3236:12333). Son las mismas que valida el
 * back con `@IsPasswordPolicy()` (`ofibites/src/core/application/dto/auth/password-policy.decorator.ts`), que
 * comparten `reset-password` y `change-password`: si cambian allí, cambian aquí. Se reutilizan en el cambio de
 * contraseña del primer login y en Mi perfil.
 */

export type PasswordRuleId = "minLength" | "uppercase" | "lowercase" | "number" | "symbol" | "noSpaces";

export const PASSWORD_MIN_LENGTH = 8;
/** Límite de bcrypt en Supabase; el back responde 400 por encima. No tiene ítem en el checklist del Figma. */
export const PASSWORD_MAX_LENGTH = 72;

interface PasswordRule {
  id: PasswordRuleId;
  /** Texto del checklist. */
  label: string;
  /** Lo que falta, para la frase "Completa para crear tu contraseña: …". */
  requirement: string;
  test: (password: string) => boolean;
}

// Mismas expresiones que el back: `[A-Z]` (la Ñ no cuenta como mayúscula) y símbolo = cualquier
// carácter que no sea letra ASCII, número ni espacio (una "ñ" o una "á" cuentan como símbolo).
const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "minLength",
    label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    requirement: `mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  { id: "uppercase", label: "Una mayúscula", requirement: "una mayúscula", test: (p) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "Una minúscula", requirement: "una minúscula", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "Un número", requirement: "un número", test: (p) => /\d/.test(p) },
  {
    id: "symbol",
    label: "Un símbolo (! @ # $ %)",
    requirement: "un símbolo",
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
  { id: "noSpaces", label: "Sin espacios", requirement: "sin espacios", test: (p) => !/\s/.test(p) },
];

export interface PasswordRuleResult {
  id: PasswordRuleId;
  label: string;
  met: boolean;
}

export function checkPasswordRules(password: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map(({ id, label, test }) => ({ id, label, met: test(password) }));
}

export function isPasswordTooLong(password: string): boolean {
  return password.length > PASSWORD_MAX_LENGTH;
}

/** Error del máximo de longitud (fuera del checklist), o `null`. */
export function getPasswordLengthError(password: string): string | null {
  return isPasswordTooLong(password)
    ? `La contraseña admite como máximo ${PASSWORD_MAX_LENGTH} caracteres.`
    : null;
}

export function isPasswordValid(password: string): boolean {
  return !isPasswordTooLong(password) && PASSWORD_RULES.every(({ test }) => test(password));
}

export type PasswordStrengthLevel = "weak" | "medium" | "strong";

export interface PasswordStrength {
  level: PasswordStrengthLevel;
  /** Segmentos llenos del medidor (1-4). */
  score: 1 | 2 | 3 | 4;
}

const STRONG_LENGTH = 12;

/**
 * Fuerza para el medidor (Figma 3339:2640, 3236:12333 y 3339:2772): `null` sin contraseña.
 * - Débil (1 segmento): cumple 3 reglas o menos ("ofibites").
 * - Media (2): cumple 4 o 5 ("Ofibites2026", sin símbolo).
 * - Fuerte: las cumple todas; 4 segmentos desde 12 caracteres ("Ofibites2026#"), 3 si es más corta.
 * Pasar de `PASSWORD_MAX_LENGTH` nunca es "Fuerte". Solo "Fuerte" habilita el envío (= `isPasswordValid`).
 */
export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  const met = PASSWORD_RULES.filter(({ test }) => test(password)).length;
  if (met === PASSWORD_RULES.length && !isPasswordTooLong(password)) {
    return { level: "strong", score: password.length >= STRONG_LENGTH ? 4 : 3 };
  }
  if (met >= 4) return { level: "medium", score: 2 };
  return { level: "weak", score: 1 };
}

/** "una mayúscula, un número y un símbolo" (vacío si no falta nada). */
export function describeMissingPasswordRules(password: string): string {
  const missing = PASSWORD_RULES.filter(({ test }) => !test(password)).map((rule) => rule.requirement);
  if (missing.length <= 1) return missing.join("");
  return `${missing.slice(0, -1).join(", ")} y ${missing[missing.length - 1]}`;
}
