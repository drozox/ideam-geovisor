# IDEAM Geovisor

Aplicación web para visualizar estaciones meteorológicas del IDEAM sobre un mapa interactivo de Colombia.

## Stack

- Next.js 15 con App Router
- React 19 y TypeScript
- Tailwind CSS 4
- React Query para caché y estados remotos
- Axios para consumo HTTP
- Leaflet y React-Leaflet para el mapa

## Estructura General

- `src/app`: layout global, providers y página principal.
- `src/app/api`: capa backend inicial para exponer estaciones a la UI.
- `src/components/Map`: mapa cargado de forma dinámica para evitar SSR con Leaflet.
- `src/components/stations`: componentes de dominio para filtros, listado y popup.
- `src/hooks`: hooks de negocio; `useStations` concentra fetch, normalización y filtros.
- `src/services`: integración con la API pública de IDEAM.
- `src/types`: contratos TypeScript del dominio.
- `docs`: decisiones y diseño técnico del modelo histórico y API.

## Variables De Entorno

Crea un archivo `.env.local` en la raíz del proyecto con estas variables:

```env
NEXT_PUBLIC_IDEAM_APP_TOKEN=tu_token_de_datos_gov_co
IDEAM_APP_TOKEN=tu_token_de_datos_gov_co
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ideam_geovisor
```

Si no configuras el token, la API puede seguir respondiendo, pero con límites más estrictos.
La lectura server-side de estaciones, dashboard e historico ahora usa Supabase. `SUPABASE_SERVICE_ROLE_KEY` no debe exponerse al navegador.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

## Validación

```bash
npm run lint
npm run test
npm run build
```

## Base De Datos

La app lee desde Supabase usando `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
`DATABASE_URL` sigue siendo necesario para correr migraciones e ingesta, y puede apuntar al Postgres de Supabase o a una base local.

Guia operativa: [Supabase Production Runbook](docs/supabase-production.md)

## PostGIS Local

Levanta la base local:

```bash
docker compose up -d
```

Aplica migraciones:

```bash
npm run db:migrate
```

Carga histórico inicial desde IDEAM:

```bash
npm run db:ingest
```

## Operacion En Supabase

Para produccion pequena, el flujo recomendado es:

1. crear el proyecto en Supabase;
2. configurar `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` e `IDEAM_APP_TOKEN`;
3. ejecutar `npm run db:migrate`;
4. ejecutar `npm run db:ingest`;
5. validar `GET /api/stations`, `GET /api/dashboard/summary` y `GET /api/stations/:stationId/history`.

Mas detalle en [docs/supabase-production.md](docs/supabase-production.md).

## Fuente De Datos

Los datos se consultan desde el dataset público de IDEAM en [datos.gov.co](https://www.datos.gov.co/resource/57sv-p2fu.json).

## API Interna

La UI ya no consulta IDEAM directamente. El flujo actual es:

- cliente -> `/api/stations`
- backend Next.js -> Supabase

La ingesta historica puede seguir consumiendo IDEAM, pero la lectura de la aplicacion ya se resuelve desde Supabase.

## Endpoints Nuevos

- `GET /api/stations`
- `GET /api/stations/:stationId`
- `GET /api/stations/:stationId/history`
- `GET /api/dashboard/summary`
