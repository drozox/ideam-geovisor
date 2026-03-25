# Historical Data And API Design

## Objetivo

Mover el geovisor de un modelo "frontend consulta IDEAM en vivo" a un modelo con:

- ingesta controlada;
- API propia estable;
- almacenamiento historico consultable;
- soporte para dashboard, series temporales y analitica.

## Arquitectura objetivo

1. `collector job`
   Consulta el dataset de IDEAM por lotes, ordenado por fecha, y escribe observaciones crudas y normalizadas.
2. `operational database`
   Guarda catalogo de estaciones, sensores y observaciones historicas.
3. `api service`
   Expone ultimos valores, series temporales y agregados para mapa y dashboard.
4. `frontend geovisor`
   Consume solo la API interna.

## Recomendacion pragmatica

Usar `PostgreSQL + PostGIS`.

Motivos:

- permite consultas espaciales cuando el dashboard crezca;
- evita rediseñar luego para bounding boxes, cercania o joins geograficos;
- soporta bien series historicas y vistas materializadas.

## Modelo de datos

### Tabla `stations`

- `id` `bigserial` PK
- `station_code` `text` unique not null
- `station_name` `text` not null
- `department` `text` not null
- `municipality` `text` not null
- `hydro_zone` `text` not null
- `entity_name` `text` not null
- `latitude` `double precision` not null
- `longitude` `double precision` not null
- `geom` `geometry(Point, 4326)` not null
- `created_at` `timestamptz` not null default `now()`
- `updated_at` `timestamptz` not null default `now()`

Indices:

- unique(`station_code`)
- gist(`geom`)
- btree(`department`, `municipality`)

### Tabla `sensors`

- `id` `bigserial` PK
- `sensor_code` `text` not null
- `sensor_description` `text` not null
- `measurement_unit` `text` not null
- `category_key` `text` not null
- `category_label` `text` not null
- `created_at` `timestamptz` not null default `now()`

Indices:

- unique(`sensor_code`, `sensor_description`, `measurement_unit`)
- btree(`category_key`)

### Tabla `station_sensors`

- `id` `bigserial` PK
- `station_id` `bigint` not null references `stations(id)`
- `sensor_id` `bigint` not null references `sensors(id)`
- `is_active` `boolean` not null default `true`
- `first_seen_at` `timestamptz` not null
- `last_seen_at` `timestamptz` not null

Indices:

- unique(`station_id`, `sensor_id`)
- btree(`last_seen_at`)

### Tabla `observations`

- `id` `bigserial` PK
- `station_id` `bigint` not null references `stations(id)`
- `sensor_id` `bigint` not null references `sensors(id)`
- `observed_at` `timestamptz` not null
- `observed_value` `double precision` not null
- `source_record_hash` `text` not null
- `source_name` `text` not null default `'datos.gov.co/57sv-p2fu'`
- `ingested_at` `timestamptz` not null default `now()`
- `raw_payload` `jsonb` not null

Indices:

- unique(`station_id`, `sensor_id`, `observed_at`, `source_record_hash`)
- btree(`observed_at` desc)
- btree(`station_id`, `sensor_id`, `observed_at` desc)
- btree(`ingested_at` desc)

### Vista materializada `latest_station_observations`

Una fila por estacion y sensor con la observacion mas reciente.

Uso:

- mapa principal;
- dashboard de estado actual;
- filtros rapidos.

## Estrategia de ingesta

### Fase inicial

- corrida programada cada `15` minutos;
- lectura paginada desde IDEAM;
- orden por `fechaobservacion desc`;
- `upsert` de estaciones y sensores;
- insercion idempotente de observaciones usando hash.

### Fase robusta

- cursor de ultima fecha ingerida;
- reproceso de ventana corta, por ejemplo ultimas `48` horas, para corregir datos tardios;
- tabla de control de corridas con metricas y errores.

## API propuesta

### `GET /api/stations`

Respuesta para mapa y sidebar.

Campos:

- lista de estaciones con ultima observacion por sensor;
- metadata de origen;
- filtros calculados en backend cuando convenga.

Query params esperados:

- `department`
- `municipality`
- `sensor`
- `limit`
- `bbox`

### `GET /api/stations/:stationCode`

Retorna detalle de estacion, sensores activos y ultima observacion.

### `GET /api/stations/:stationCode/history`

Retorna serie temporal.

Query params:

- `sensor`
- `from`
- `to`
- `bucket` con valores como `hour`, `day`, `week`

### `GET /api/dashboard/summary`

Retorna:

- total de estaciones activas;
- estaciones sin reporte reciente;
- conteo por departamento;
- conteo por categoria de sensor;
- ultimos timestamps disponibles;
- outliers o alertas simples.

## Casos de uso del dashboard

- tendencia por estacion o sensor;
- cobertura por departamento;
- mapa temporal por rango de fechas;
- estaciones sin transmision en las ultimas `N` horas;
- top maximos y minimos por sensor;
- comparativo contra promedio historico.

## Tradeoffs

### Opcion rapida

Guardar snapshots JSON locales o en SQLite.

- ventaja: implementacion corta;
- desventaja: mala escalabilidad y pocas consultas.

### Opcion intermedia recomendada

`PostgreSQL + PostGIS` con cron de ingesta.

- ventaja: equilibrio entre simplicidad y capacidad analitica;
- desventaja: agrega una pieza operativa.

### Opcion robusta

`PostgreSQL + PostGIS` + colas + particionado de observaciones + jobs dedicados.

- ventaja: mejor para volumen alto y multiples fuentes;
- desventaja: costo operativo mayor.

## Siguiente paso recomendado

Implementar primero la capa API interna y mover el frontend a esa API. Luego agregar persistencia en `PostgreSQL` sin volver a tocar la UI.
