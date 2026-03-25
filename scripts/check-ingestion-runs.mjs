import process from "node:process";
import { Client } from "pg";

const DEFAULT_MAX_RUN_AGE_HOURS = 6;
const DEFAULT_LOOKBACK_HOURS = 24;
const DEFAULT_MAX_FAILURES = 0;
const DEFAULT_RECENT_LIMIT = 5;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function main() {
  const databaseUrl = getRequiredEnv("DATABASE_URL");
  const maxRunAgeHours = parsePositiveInt(
    process.env.INGESTION_MAX_RUN_AGE_HOURS,
    DEFAULT_MAX_RUN_AGE_HOURS,
  );
  const lookbackHours = parsePositiveInt(
    process.env.INGESTION_LOOKBACK_HOURS,
    DEFAULT_LOOKBACK_HOURS,
  );
  const maxFailures = parsePositiveInt(
    process.env.INGESTION_MAX_FAILURES,
    DEFAULT_MAX_FAILURES + 1,
  ) - 1;
  const recentLimit = parsePositiveInt(
    process.env.INGESTION_RECENT_LIMIT,
    DEFAULT_RECENT_LIMIT,
  );

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const latestRunResult = await client.query(
      `
        SELECT
          id,
          started_at,
          completed_at,
          status,
          fetched_count,
          inserted_count,
          error_message
        FROM ingestion_runs
        ORDER BY started_at DESC
        LIMIT 1
      `,
    );

    if (latestRunResult.rows.length === 0) {
      throw new Error("No ingestion runs found.");
    }

    const latestRun = latestRunResult.rows[0];
    const latestReferenceTime = latestRun.completed_at ?? latestRun.started_at;
    const latestRunAgeHours =
      (Date.now() - new Date(latestReferenceTime).getTime()) / (1000 * 60 * 60);

    const failuresResult = await client.query(
      `
        SELECT COUNT(*)::int AS total
        FROM ingestion_runs
        WHERE status = 'failed'
          AND started_at >= NOW() - ($1::text || ' hours')::interval
      `,
      [lookbackHours],
    );

    const failuresInLookback = failuresResult.rows[0]?.total ?? 0;

    const recentRunsResult = await client.query(
      `
        SELECT
          id,
          started_at,
          completed_at,
          status,
          fetched_count,
          inserted_count
        FROM ingestion_runs
        ORDER BY started_at DESC
        LIMIT $1
      `,
      [recentLimit],
    );

    const summary = {
      latestRun: {
        id: latestRun.id,
        status: latestRun.status,
        startedAt: latestRun.started_at,
        completedAt: latestRun.completed_at,
        fetchedCount: latestRun.fetched_count,
        insertedCount: latestRun.inserted_count,
        errorMessage: latestRun.error_message,
        ageHours: Number(latestRunAgeHours.toFixed(2)),
      },
      failuresInLookback,
      lookbackHours,
      maxRunAgeHours,
      maxFailures,
      recentRuns: recentRunsResult.rows,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (latestRun.status !== "completed") {
      throw new Error(`Latest ingestion run is not completed: ${latestRun.status}`);
    }

    if (latestRunAgeHours > maxRunAgeHours) {
      throw new Error(
        `Latest ingestion run is stale: ${latestRunAgeHours.toFixed(2)}h > ${maxRunAgeHours}h`,
      );
    }

    if (failuresInLookback > maxFailures) {
      throw new Error(
        `Too many failed ingestion runs in the last ${lookbackHours}h: ${failuresInLookback}`,
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
