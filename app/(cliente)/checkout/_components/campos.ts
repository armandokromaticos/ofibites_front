import { AtInputProps } from "@/ui/atomic";

/**
 * Campos del checkout (Figma 3462:2094): label encima en Inter 600 12 y píldora de 44 px (más baja que la de 57 del
 * login: el checkout es un formulario denso de una página). El resto del estilo es el de `AtInput`.
 */
export const CLASES_CAMPO: NonNullable<AtInputProps["classNames"]> = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  inputWrapper: "h-11",
  input: "text-sm font-normal",
};

/** Mismo estilo para `AtTextarea` (notas). */
export const CLASES_AREA = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  input: "text-sm font-normal",
};

/** Título de cada bloque del paso (Playfair 700 20, Figma). */
export const CLASE_TITULO_BLOQUE = "font-display text-xl font-bold leading-7 text-foreground";

/** Ayuda bajo el título de un bloque. */
export const CLASE_AYUDA_BLOQUE = "text-xs leading-[18px] text-subtle";
