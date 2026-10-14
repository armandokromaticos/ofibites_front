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
app/                    rutas App Router (admin/, login/, register/, api/ ...). Las páginas componen y conectan datos.
app/lib/atomic/         design system (atomic design): atoms At* · molecules Ml* · organisms Or* · templates Tm*
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

- **Atomic design**: un nivel solo importa de niveles inferiores (`Tm → Or → Ml → At`). Los componentes atómicos no llaman a la API: reciben datos y callbacks por props. Importar desde `@/app/lib/atomic`. Detalle en la skill `ofibites-design`.
- Reutilizar antes de crear: buscar en `app/lib/atomic/`.
- Endpoints de empresa: enviar el header `X-Company-Id`. Sin él, el backend responde 400.
- Precios: se muestran los que devuelve la API, nunca se calculan como verdad en el cliente.
- Fechas `@db.Date` (p. ej. `deliveryDate`): mostrarlas como fecha pura, sin conversión de zona horaria.

Reglas de negocio compartidas y lecciones aprendidas: workspace `../conocimiento/`.
