# Contexto

IDEAM Geovisor es una aplicacion web para visualizar estaciones meteorologicas del IDEAM en un mapa interactivo de Colombia. El proyecto esta evolucionando desde un consumo directo del dataset publico de IDEAM hacia una arquitectura con API interna, persistencia historica y capacidades de dashboard sobre una base PostgreSQL/PostGIS.

# Stack tecnologico

- Next.js 15 con App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Query
- Axios
- Leaflet y React-Leaflet
- PostgreSQL con PostGIS
- Supabase como backend de lectura para la aplicacion
- `@supabase/supabase-js` para acceso server-side a Supabase
- Node.js para scripts de migracion e ingesta
- Vitest y Testing Library para pruebas

# Arquitectura / Enfoque

El proyecto esta organizado como una aplicacion Next.js con frontend y backend en el mismo repositorio.

- `src/app`: shell principal de la aplicacion y rutas API con App Router
- `src/app/api`: capa backend interna para exponer estaciones, historico y resumen de dashboard
- `src/components`: UI del mapa, dashboard, filtros y listado de estaciones
- `src/hooks`: hooks de consulta y estado de negocio para la UI
- `src/services`: servicios cliente y servidor para consumir la API interna, IDEAM y la base historica
- `src/lib/server`: acceso server-only a PostgreSQL
- `db/migrations`: migraciones SQL del esquema
- `scripts`: utilidades operativas para migrar e ingerir datos historicos
- `docs`: diseno tecnico y decisiones de arquitectura

Enfoque actual:

- la UI consume la API interna de Next.js;
- la API interna lee estaciones, dashboard e historico desde Supabase;
- la ingesta historica sigue trayendo datos desde IDEAM hacia la base;
- la base historica soporta dashboard, trazabilidad temporal y futuras consultas geoespaciales.

# Decisiones tecnicas

- Se desacoplo el frontend de la fuente publica de IDEAM: el cliente debe consumir `/api/*` y no la API externa directamente.
- La persistencia historica se basa en PostgreSQL + PostGIS para habilitar consultas temporales y geoespaciales sin rediseno posterior.
- La conexion a base de datos se resuelve mediante `DATABASE_URL`, lo que deja el proyecto compatible con despliegues sobre Supabase o cualquier PostgreSQL administrado.
- La app usa `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` para resolver la lectura server-side desde Supabase.
- La ingesta historica usa insercion idempotente con `source_record_hash` para evitar duplicados.
- La vista materializada `latest_station_observations` concentra el estado mas reciente por estacion y sensor para acelerar mapa y dashboard.
- Para simplificar el proyecto pequeno, Supabase pasa a ser la plataforma elegida para la lectura de datos de la aplicacion.
- `MEMORY.md` es la fuente de verdad contextual del proyecto y debe leerse antes de tareas relevantes y actualizarse despues de cambios relevantes.

# Cambios recientes

- [2026-03-21] Se definio la arquitectura objetivo para pasar de consultas directas a IDEAM hacia API interna, almacenamiento historico y dashboard, documentada en `docs/historical-data-design.md`.
- [2026-03-21] Se creo el esquema inicial PostgreSQL/PostGIS con tablas `stations`, `sensors`, `station_sensors`, `observations`, `ingestion_runs`, triggers de `updated_at` y la vista materializada `latest_station_observations`.
- [2026-03-21] Se agregaron scripts operativos para aplicar migraciones (`scripts/migrate.mjs`) e ingerir historico desde IDEAM (`scripts/ingest-ideam-history.mjs`).
- [2026-03-21] Se implemento la capa server-only de acceso a base de datos en `src/lib/server/db.ts`.
- [2026-03-21] Se incorporaron endpoints internos para estaciones, detalle por estacion, historico y resumen de dashboard en `src/app/api`.
- [2026-03-21] El frontend quedo migrado a consumir la API interna mediante `src/services/ideamServices.ts`.
- [2026-03-24] Se inicializo `MEMORY.md` y se formalizo el protocolo de memoria persistente del proyecto para mantener continuidad, decisiones tecnicas y pendientes.
- [2026-03-24] Se adopto Supabase como backend de lectura para la app. `src/services/ideamServerService.ts` y `src/services/historicalService.ts` pasaron a consultar Supabase, se agrego `src/lib/server/supabase.ts`, se creo la migracion `db/migrations/002_supabase_read_models.sql` y la validacion local paso con `npm run test` y `npm run build`.
- [2026-03-24] Se preparo `.env.local` para Supabase con `NEXT_PUBLIC_SUPABASE_URL` inferido desde el `DATABASE_URL`. La conexion real queda bloqueada hasta cargar `SUPABASE_SERVICE_ROLE_KEY`.
- [2026-03-24] Se valido la conexion real a Supabase con `service_role`. La tabla `stations` respondio con 620 registros al inicio de la validacion.
- [2026-03-24] Se ejecuto `scripts/migrate.mjs` contra Supabase y se aplico `002_supabase_read_models.sql`.
- [2026-03-24] Se ejecuto `scripts/ingest-ideam-history.mjs` contra Supabase. El proceso reporto `fetched=5000 inserted=5000`; el wrapper del comando devolvio timeout al final, pero la ingesta completo.
- [2026-03-24] Se validaron los read models en Supabase: `station_latest_snapshot` respondio con 628 filas, `observation_read_model` devolvio datos y `get_dashboard_summary()` respondio con las claves esperadas.
- [2026-03-25] Se documento el despliegue y la operacion con Supabase en `docs/supabase-production.md`, y se alinearon `README.md` y `.env.example` con el flujo de produccion.
- [2026-03-25] Se corrigio el mock de `src/services/historicalService.test.ts` para el chain de Supabase y la suite completa de pruebas paso con `npm run test`.
- [2026-03-25] Se valido el runtime de las rutas compiladas de Next contra Supabase poblado: `/api/stations`, `/api/dashboard/summary` y `/api/stations/[stationId]/history` respondieron 200 para el stationId `0024035510`.
- [2026-03-25] Se agrego `scripts/check-ingestion-runs.mjs` y el script `npm run db:check-ingestion` para monitorear `ingestion_runs`, detectar corridas stale y revisar fallos recientes. La politica operativa recomendada para este proyecto pequeno quedo en ingesta horaria.
- [2026-03-25] Se corrigio el warning de React por keys duplicadas en `src/components/dashboard/StationHistoryPanel.tsx` usando una key compuesta y se agrego una prueba de regresion en `src/components/dashboard/StationHistoryPanel.test.tsx`. La validacion posterior paso con `npm run test` y `npm run build`.

# Pendientes

- Validar extremo a extremo el flujo `docker compose -> db:migrate -> db:ingest -> dashboard`.
- Hacer un smoke test con servidor Next vivo (`next dev` o `next start`) fuera del sandbox actual; aqui la ejecucion quedo limitada por `spawn EPERM`.
- Ejecutar la ingesta periodica segun la politica horaria y conectar `npm run db:check-ingestion` a un scheduler o monitor externo.
- Mantener este archivo actualizado despues de cada cambio relevante sin eliminar contexto previo ni duplicar informacion.
