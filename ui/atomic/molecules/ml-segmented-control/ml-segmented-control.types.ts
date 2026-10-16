export interface MlSegmentedControlOption {
  value: string;
  /** Texto visible del segmento ("8"). */
  label: string;
  /** Nombre accesible si el visible no basta ("8 personas"). Por defecto `label`. */
  ariaLabel?: string;
}

export interface MlSegmentedControlProps {
  /** Nombre del grupo de radios. */
  name: string;
  /** Pregunta visible ("Selecciona la cantidad de personas"); es el nombre accesible del grupo. */
  label: string;
  options: MlSegmentedControlOption[];
  value: string | null;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  className?: string;
}
