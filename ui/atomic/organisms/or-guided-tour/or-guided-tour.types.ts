export type OrGuidedTourPlacement = "top" | "bottom" | "left" | "right";

export interface OrGuidedTourStep {
  /**
   * Valor del atributo `data-tour` del elemento a destacar. Con varios, gana el primero visible (p. ej. el
   * riel del sidebar en escritorio y la hamburguesa en móvil). Si ninguno está en pantalla (aún cargando,
   * sección vacía), la tarjeta sale centrada sin foco y el foco aparece en cuanto el elemento se monta.
   */
  target: string | string[];
  title: string;
  description: string;
  /** Lado preferido para la tarjeta. Si no cabe, se prueba abajo, arriba, derecha e izquierda. */
  placement?: OrGuidedTourPlacement;
  /** Margen del foco alrededor del elemento, en px. Por defecto 12. */
  padding?: number;
}

/** Cómo se cerró: "Omitir recorrido" o Esc (`skip`), o el botón del último paso (`finish`). */
export type OrGuidedTourCloseReason = "skip" | "finish";

export interface OrGuidedTourProps {
  steps: OrGuidedTourStep[];
  isOpen: boolean;
  onClose: (reason: OrGuidedTourCloseReason) => void;
  /** Botón de avance. Por defecto "Siguiente". */
  nextLabel?: string;
  /** Botón del último paso (no lleva "Omitir"). Por defecto "Finalizar". */
  finishLabel?: string;
  /** Por defecto "Omitir recorrido". */
  skipLabel?: string;
  /**
   * Selector al que vuelve el foco al cerrar si el elemento que lo tenía al abrir ya no existe o era el
   * `<body>` (p. ej. el tour se abrió solo al cargar la página). Por ejemplo `"#app-main"`.
   */
  returnFocusFallback?: string;
}
