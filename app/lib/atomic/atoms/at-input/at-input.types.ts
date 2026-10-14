import { InputProps } from "@heroui/react";

/**
 * Props de HeroUI `Input`. Por defecto: `variant="bordered"`, `radius="full"`, `size="md"`
 * con el estilo del Figma (h57, fondo `background`, borde `border-input`). Los `classNames`
 * del caller se fusionan por slot y ganan sobre los del átomo.
 *
 * Estado de error (Figma 3388:2250): borde `accent` de 2 px, label y mensaje en `secondary-600`
 * (AA sobre crema) y un punto `accent` delante del mensaje. Label y borde usan `!`
 * (`group-data-[invalid=true]:!border-accent`, `group-data-[invalid=true]:!text-secondary-600`)
 * para ganar al `!text-danger` de HeroUI: un caller que quiera otro color de error tiene que usar
 * también `!` y la misma variante `group-data-[invalid=true]:`. El mensaje (`errorMessage`) va sin `!`.
 */
export type AtInputProps = InputProps;
