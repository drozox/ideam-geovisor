import crypto from "node:crypto";
import process from "node:process";
import { Client } from "pg";

const IDEAM_API_URL = "https://www.datos.gov.co/resource/57sv-p2fu.json";
const DEFAULT_LIMIT = 5000;
const REQUEST_TIMEOUT_MS = 20000;

function normalizeText(value) {
  return (value ?? "").toString().trim();
}

function parseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeSensor(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function classifySensor(description) {
  const sensor = normalizeSensor(description);

  if (sensor.includes("PRECIPITACION") || sensor.includes("PLUVI")) {
    return { key: "precipitacion", label: "Precipitacion" };
  }

  if (sensor.includes("TEMPERATURA") || sensor.includes("TERM")) {
    return { key: "temperatura", label: "Temperatura" };
  }

  if (sensor.includes("HUMEDAD")) {
    return { key: "humedad", label: "Humedad" };
  }

  if (sensor.includes("PRESION")) {
    return { key: "presion", label: "Presion" };
  }

  if (sensor.includes("VIENTO")) {
    return { key: "viento", label: "Viento" };
  }

  if (sensor.includes("NIVEL") || sensor.includes("CAUDAL")) {
    return { key: "hidrologia", label: "Nivel/Caudal" };
  }

  return { key: "otros", label: "Otros" };
}

function normalizeStation(raw) {
  const station = {
    codigoestacion: normalizeText(raw.codigoestacion),
    codigosensor: normalizeText(raw.codigosensor),
    fechaobservacion: normalizeText(raw.fechaobservacion),
    valorobservado: parseNumber(raw.valorobservado),
    nombreestacion: normalizeText(raw.nombreestacion),
    latitud: parseNumber(raw.latitud),
    longitud: parseNumber(raw.longitud),
    departamento: normalizeText(raw.departamento),
    municipio: normalizeText(raw.municipio),
    zonahidrografica: normalizeText(raw.zonahidrografica),
    descripcionsensor: normalizeText(raw.descripcionsensor),
    unidadmedida: normalizeText(raw.unidadmedida),
    entidad: normalizeText(raw.entidad),
  };

  const required = [
    station.codigoestacion,
    station.codigosensor,
    station.fechaobservacion,
    station.nombreestacion,
    station.departamento,
    station.municipio,
    station.zonahidrografica,
    station.descripcionsensor,
    station.unidadmedida,
    station.entidad,
  ].every(Boolean);

  if (
    !required ||
    station.latitud === null ||
    station.longitud === null ||
    station.valorobservado === null
  ) {
    return null;
  }

  return station;
}

function buildRecordHash(raw) {
  return crypto.createHash("sha256").update(JSON.stringify(raw)).digest("hex");
}

async function fetchRawRecords() {
  const params = new URLSearchParams({
    $limit: String(DEFAULT_LIMIT),
    $order: "fechaobservacion DESC",
  });

  const appToken =
    process.env.IDEAM_APP_TOKEN ?? process.env.NEXT_PUBLIC_IDEAM_APP_TOKEN;

  if (appToken) {
    params.set("$$app_token", appToken);
  }

  const response = await fetch(`${IDEAM_API_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`IDEAM upstream responded with ${response.status}`);
  }

  return await response.json();
}

async function upsertStation(client, station) {
  const result = await client.query(
    `
      INSERT INTO stations (
        station_code,
        station_name,
        department,
        municipality,
        hydro_zone,
        entity_name,
        latitude,
        longitude,
        geom
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($8, $7), 4326)
      )
      ON CONFLICT (station_code) DO UPDATE
      SET station_name = EXCLUDED.station_name,
          department = EXCLUDED.department,
          municipality = EXCLUDED.municipality,
          hydro_zone = EXCLUDED.hydro_zone,
          entity_name = EXCLUDED.entity_name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          geom = EXCLUDED.geom
      RETURNING id;
    `,
    [
      station.codigoestacion,
      station.nombreestacion,
      station.departamento,
      station.municipio,
      station.zonahidrografica,
      station.entidad,
      station.latitud,
      station.longitud,
    ],
  );

  return result.rows[0].id;
}

async function upsertSensor(client, station) {
  const category = classifySensor(station.descripcionsensor);
  const result = await client.query(
    `
      INSERT INTO sensors (
        sensor_code,
        sensor_description,
        measurement_unit,
        category_key,
        category_label
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (sensor_code, sensor_description, measurement_unit) DO UPDATE
      SET category_key = EXCLUDED.category_key,
          category_label = EXCLUDED.category_label
      RETURNING id;
    `,
    [
      station.codigosensor,
      station.descripcionsensor,
      station.unidadmedida,
      category.key,
      category.label,
    ],
  );

  return result.rows[0].id;
}

async function upsertStationSensor(client, stationId, sensorId, observedAt) {
  await client.query(
    `
      INSERT INTO station_sensors (
        station_id,
        sensor_id,
        first_seen_at,
        last_seen_at
      )
      VALUES ($1, $2, $3, $3)
      ON CONFLICT (station_id, sensor_id) DO UPDATE
      SET is_active = TRUE,
          first_seen_at = LEAST(station_sensors.first_seen_at, EXCLUDED.first_seen_at),
          last_seen_at = GREATEST(station_sensors.last_seen_at, EXCLUDED.last_seen_at);
    `,
    [stationId, sensorId, observedAt],
  );
}

async function insertObservation(client, stationId, sensorId, station, raw) {
  const observedAt = new Date(station.fechaobservacion);

  if (Number.isNaN(observedAt.getTime())) {
    return 0;
  }

  const result = await client.query(
    `
      INSERT INTO observations (
        station_id,
        sensor_id,
        observed_at,
        observed_value,
        source_record_hash,
        raw_payload
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      ON CONFLICT (station_id, sensor_id, observed_at, source_record_hash) DO NOTHING;
    `,
    [
      stationId,
      sensorId,
      observedAt.toISOString(),
      station.valorobservado,
      buildRecordHash(raw),
      JSON.stringify(raw),
    ],
  );

  await upsertStationSensor(client, stationId, sensorId, observedAt.toISOString());
  return result.rowCount ?? 0;
}

async function refreshLatestView(client) {
  await client.query("REFRESH MATERIALIZED VIEW latest_station_observations");
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to ingest historical data.");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const run = await client.query(
    "INSERT INTO ingestion_runs (status) VALUES ('running') RETURNING id",
  );
  const runId = run.rows[0].id;

  try {
    const rawRecords = await fetchRawRecords();
    const stations = rawRecords
      .map((raw) => ({ raw, station: normalizeStation(raw) }))
      .filter((entry) => entry.station !== null);

    let insertedCount = 0;

    await client.query("BEGIN");

    for (const entry of stations) {
      const stationId = await upsertStation(client, entry.station);
      const sensorId = await upsertSensor(client, entry.station);
      insertedCount += await insertObservation(
        client,
        stationId,
        sensorId,
        entry.station,
        entry.raw,
      );
    }

    await refreshLatestView(client);
    await client.query("COMMIT");

    await client.query(
      `
        UPDATE ingestion_runs
        SET completed_at = NOW(),
            status = 'completed',
            fetched_count = $2,
            inserted_count = $3
        WHERE id = $1
      `,
      [runId, rawRecords.length, insertedCount],
    );

    console.log(
      `Ingestion completed. fetched=${rawRecords.length} inserted=${insertedCount}`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    await client.query(
      `
        UPDATE ingestion_runs
        SET completed_at = NOW(),
            status = 'failed',
            error_message = $2
        WHERE id = $1
      `,
      [runId, error instanceof Error ? error.message : "Unknown error"],
    );
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
