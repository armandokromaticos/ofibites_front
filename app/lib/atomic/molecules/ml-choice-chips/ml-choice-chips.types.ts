export interface MlChoiceChipsOption {
  value: string;
  label: string;
}

export interface MlChoiceChipsProps {
  /** Nombre del grupo de radios (también sirve para enfocarlo desde fuera con `[name=...]`). */
  name: string;
  /** Pregunta visible; es el nombre accesible del grupo. */
  label: string;
  options: MlChoiceChipsOption[];
  value: string | null;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  className?: string;
}
