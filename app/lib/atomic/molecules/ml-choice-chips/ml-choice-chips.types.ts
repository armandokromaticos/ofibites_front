export interface MlChoiceChipsOption {
  value: string;
  label: string;
}

interface MlChoiceChipsBaseProps {
  /** Nombre del grupo (también sirve para enfocarlo desde fuera con `[name=...]`). */
  name: string;
  /** Pregunta visible; es el nombre accesible del grupo. */
  label: string;
  /** Ayuda bajo la pregunta (p. ej. "Elige todas las que apliquen"). */
  description?: string;
  options: MlChoiceChipsOption[];
  /** Columnas a partir de `sm` (en móvil siempre 2). Por defecto 5. */
  columns?: 2 | 3 | 4 | 5 | 6;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  className?: string;
}

/** Elección única (radios). Es el modo por defecto. */
export interface MlChoiceChipsSingleProps extends MlChoiceChipsBaseProps {
  selectionMode?: "single";
  value: string | null;
  onChange: (value: string) => void;
}

/** Elección múltiple (casillas). `onChange` recibe la selección en el orden de `options`. */
export interface MlChoiceChipsMultipleProps extends MlChoiceChipsBaseProps {
  selectionMode: "multiple";
  value: string[];
  onChange: (value: string[]) => void;
}

export type MlChoiceChipsProps = MlChoiceChipsSingleProps | MlChoiceChipsMultipleProps;
