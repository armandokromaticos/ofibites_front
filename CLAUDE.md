# CLAUDE.md

Guía para Claude Code en este repo.

## Proyecto

Frontend de OfiBites, plataforma B2B de aprovisionamiento corporativo. Next.js 16 (App Router, Turbopack) + React 19 + HeroUI + Tailwind 4 + React Query + Zustand. Consume la API NestJS de `../ofibites` (prefijo `/api`). Código y commits en español. Gestor: **yarn**. Integración en `develop`.

## Comandos

```bash
yarn dev                     # http://localhost:3001 (el backend usa el 3000)
yarn lint                    # eslint (simple-import-sort es error)
npx tsc --noEmit             # typecheck
NEXT_PUBLIC_API_URL=http://localhost:3000/api yarn build   # el build de prod falla sin esta variable
```

## Arquitectura

```
app/                    solo rutas App Router y archivos especiales (layout, providers, globals.css, page, favicon)
  (auth)/               login/ (+ _components: formulario, pantalla, variante, surtidos) · forgot-password/ · reset-password/ · register/
  (cliente)/            layout.tsx (guarda CLIENT + TmAppLayout persistente) · _navegacion.tsx (menú, rutas y PAGINAS_CLIENTE: título/ítem activo por pathname)
                        _components/app-cliente.tsx · dashboard/ (_components) · ordenar/ (_components)
  (admin)/admin/        layout.tsx (guarda de plataforma + TmAdminLayout) · products/ · users/
  (dev)/dev/            ui/ (catálogo) · qr/ (demo QR): page.dev.tsx, fuera del build de producción
  api/orders/validate/  Route Handler (proxy de validación de órdenes)
                        Las páginas componen y conectan datos; lo privado de una ruta va en _components/ y _data/ (no enrutan).
ui/atomic/              design system (atomic design, alias @/ui/atomic): atoms At* · molecules Ml* · organisms Or* · templates Tm*
domain/
  services/             llamadas HTTP a la API (únicas que hacen fetch)
  hooks/<feature>/      hooks React Query sobre los services
  stores/               Zustand (estado de cliente global: auth)
  types/api/            tipos de la API, alineados con el toResponseDto del backend
  models/ adapters/     modelos de UI y adaptación desde la API
shared/                 config (react-query), constants/api.ts (API_BASE_URL), utils/fetch, utils/storage, types
```

Flujo de datos: `page.tsx` → hook (`domain/hooks`) → service (`domain/services`) → `shared/utils/fetch` → API.

## Reglas

- **Atomic design**: un nivel solo importa de niveles inferiores (`Tm → Or → Ml → At`). Los componentes atómicos no llaman a la API: reciben datos y callbacks por props. Importar desde `@/ui/atomic`. Detalle en la skill `ofibites-design`.
- Reutilizar antes de crear: buscar en `ui/atomic/`.
- Rutas de un área nueva: dentro de su grupo (`(cliente)`, `(admin)`...), sin montar el template en la página (lo pone el `layout.tsx` del área).
- Endpoints de empresa: enviar el header `X-Company-Id`. Sin él, el backend responde 400.
- Precios: se muestran los que devuelve la API, nunca se calculan como verdad en el cliente.
- Fechas `@db.Date` (p. ej. `deliveryDate`): mostrarlas como fecha pura, sin conversión de zona horaria.

Reglas de negocio compartidas y lecciones aprendidas: workspace `../conocimiento/`.
