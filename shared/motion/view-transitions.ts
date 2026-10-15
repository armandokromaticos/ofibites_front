/**
 * Nombres y clases de las View Transitions entre rutas (React `ViewTransition` + App Router).
 * Los estilos de `::view-transition-*` están en `app/globals.css`, con los tokens de motion.
 */
export const VIEW_TRANSITION_CLASS = {
  /** Contenido de una página: fundido y desplazamiento corto (320 ms entrada, 200 ms salida). */
  page: "ofi-page",
  /** Elemento compartido entre dos rutas: se mueve y cambia de tamaño a su nueva posición. */
  shared: "ofi-shared",
} as const;

/** Un nombre solo puede estar una vez en pantalla. */
export const VIEW_TRANSITION_NAME = {
  /** Logo: acceso ↔ acceso y acceso → sidebar de la app. */
  logo: "ofi-logo",
  /** Columna del formulario de las pantallas de acceso (login, recuperar, restablecer, solicitud). */
  authPanel: "ofi-auth-panel",
  /** Sidebar de la app: grupo propio para que no se desplace con el contenido de la página. */
  appSidebar: "ofi-app-sidebar",
  /** Drawer móvil y su scrim, solo mientras están abiertos: por encima de la página que entra. */
  appDrawer: "ofi-app-drawer",
  appDrawerScrim: "ofi-app-drawer-scrim",
} as const;
