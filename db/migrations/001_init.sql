CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS stations (
  id BIGSERIAL PRIMARY KEY,
  station_code TEXT NOT NULL UNIQUE,
  station_name TEXT NOT NULL,
  department TEXT NOT NULL,
  municipality TEXT NOT NULL,
  hydro_zone TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geom geometry(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_geom ON stations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_stations_department_municipality
  ON stations (department, municipality);

CREATE TABLE IF NOT EXISTS sensors (
  id BIGSERIAL PRIMARY KEY,
  sensor_code TEXT NOT NULL,
  sensor_description TEXT NOT NULL,
  measurement_unit TEXT NOT NULL,
  category_key TEXT NOT NULL,
  category_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sensor_code, sensor_description, measurement_unit)
);

CREATE INDEX IF NOT EXISTS idx_sensors_category_key ON sensors (category_key);

CREATE TABLE IF NOT EXISTS station_sensors (
  id BIGSERIAL PRIMARY KEY,
  station_id BIGINT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  sensor_id BIGINT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (station_id, sensor_id)
);

CREATE INDEX IF NOT EXISTS idx_station_sensors_last_seen_at
  ON station_sensors (last_seen_at DESC);

CREATE TABLE IF NOT EXISTS observations (
  id BIGSERIAL PRIMARY KEY,
  station_id BIGINT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  sensor_id BIGINT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  observed_value DOUBLE PRECISION NOT NULL,
  source_record_hash TEXT NOT NULL,
  source_name TEXT NOT NULL DEFAULT 'datos.gov.co/57sv-p2fu',
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB NOT NULL,
  UNIQUE (station_id, sensor_id, observed_at, source_record_hash)
);

CREATE INDEX IF NOT EXISTS idx_observations_observed_at
  ON observations (observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_observations_station_sensor_observed_at
  ON observations (station_id, sensor_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_observations_ingested_at
  ON observations (ingested_at DESC);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  fetched_count INTEGER NOT NULL DEFAULT 0,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_started_at
  ON ingestion_runs (started_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stations_updated_at ON stations;
CREATE TRIGGER trg_stations_updated_at
BEFORE UPDATE ON stations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_station_sensors_updated_at ON station_sensors;
CREATE TRIGGER trg_station_sensors_updated_at
BEFORE UPDATE ON station_sensors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE MATERIALIZED VIEW IF NOT EXISTS latest_station_observations AS
SELECT DISTINCT ON (o.station_id, o.sensor_id)
  o.id,
  o.station_id,
  o.sensor_id,
  o.observed_at,
  o.observed_value,
  o.source_name,
  o.ingested_at
FROM observations o
ORDER BY o.station_id, o.sensor_id, o.observed_at DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_latest_station_observations_unique
  ON latest_station_observations (station_id, sensor_id);
