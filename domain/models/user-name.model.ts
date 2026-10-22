/**
 * Nombre y apellido sobre `User.name` (el back guarda un solo campo). Se separa por el **primer espacio**
 * (heurística): el resto, aunque tenga más espacios, es "apellido". Lo usan "Editar usuario" (T-29d) y
 * "Mi perfil" (T-30).
 */
export function separarNombreApellido(name: string): { firstName: string; lastName: string } {
  const limpio = name.trim();
  const indice = limpio.indexOf(" ");
  if (indice === -1) return { firstName: limpio, lastName: "" };
  return { firstName: limpio.slice(0, indice), lastName: limpio.slice(indice + 1).trim() };
}

/** Une Nombre y Apellido con un espacio (sin espacios sobrantes si el apellido va vacío). */
export function unirNombreApellido(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
