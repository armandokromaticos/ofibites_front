export interface MlRadioCardOption {
  value: string;
  /** Título de la tarjeta ("Torre Principal"). */
  title: string;
  /** Línea secundaria ("Av. El Bosque, Chacaíto · Caracas"). */
  description?: string;
}

export interface MlRadioCardGroupProps {
  /** Nombre del grupo de radios (también sirve para enfocarlo desde fuera con `[name=...]`). */
  name: string;
  /** Id del título visible que nombra el grupo (p. ej. el `h2` de la sección). */
  labelledBy: string;
  /** Id de la ayuda bajo el título. */
  describedBy?: string;
  options: MlRadioCardOption[];
  value: string | null;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  className?: string;
}
