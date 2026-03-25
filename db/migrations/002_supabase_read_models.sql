CREATE OR REPLACE VIEW station_latest_snapshot AS
SELECT DISTINCT ON (s.id)
  s.station_code AS codigoestacion,
  se.sensor_code AS codigosensor,
  lso.observed_at AS fechaobservacion,
  lso.observed_value AS valorobservado,
  s.station_name AS nombreestacion,
  s.latitude AS latitud,
  s.longitude AS longitud,
  s.department AS departamento,
  s.municipality AS municipio,
  s.hydro_zone AS zonahidrografica,
  se.sensor_description AS descripcionsensor,
  se.measurement_unit AS unidadmedida,
  s.entity_name AS entidad
FROM latest_station_observations lso
JOIN stations s ON s.id = lso.station_id
JOIN sensors se ON se.id = lso.sensor_id
ORDER BY s.id, lso.observed_at DESC, se.sensor_code ASC;

CREATE OR REPLACE VIEW observation_read_model AS
SELECT
  s.station_code,
  s.station_name,
  se.sensor_code,
  se.sensor_description,
  se.measurement_unit,
  o.observed_at,
  o.observed_value
FROM observations o
JOIN stations s ON s.id = o.station_id
JOIN sensors se ON se.id = o.sensor_id;

CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'totalStations',
    COALESCE(
      (
        SELECT COUNT(DISTINCT station_id)
        FROM latest_station_observations
      ),
      0
    ),
    'activeStationSensors',
    COALESCE(
      (
        SELECT COUNT(*)
        FROM latest_station_observations
      ),
      0
    ),
    'staleStationSensors24h',
    COALESCE(
      (
        SELECT COUNT(*)
        FROM latest_station_observations
        WHERE observed_at < NOW() - INTERVAL '24 hours'
      ),
      0
    ),
    'latestObservationAt',
    (
      SELECT MAX(observed_at)
      FROM latest_station_observations
    ),
    'byDepartment',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('label', department, 'total', total)
          ORDER BY total DESC, department ASC
        )
        FROM (
          SELECT s.department AS department, COUNT(DISTINCT lso.station_id) AS total
          FROM latest_station_observations lso
          JOIN stations s ON s.id = lso.station_id
          GROUP BY s.department
        ) department_counts
      ),
      '[]'::jsonb
    ),
    'bySensorCategory',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('key', category_key, 'label', category_label, 'total', total)
          ORDER BY total DESC, category_label ASC
        )
        FROM (
          SELECT se.category_key, se.category_label, COUNT(*) AS total
          FROM latest_station_observations lso
          JOIN sensors se ON se.id = lso.sensor_id
          GROUP BY se.category_key, se.category_label
        ) sensor_counts
      ),
      '[]'::jsonb
    )
  );
$$;
