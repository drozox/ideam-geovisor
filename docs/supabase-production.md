# Supabase Production Runbook

## Scope

This project uses Supabase as the server-side read backend for stations, dashboard summary, and station history.
The app still ingests data from IDEAM, but production reads come from Supabase.

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `IDEAM_APP_TOKEN` or `NEXT_PUBLIC_IDEAM_APP_TOKEN`

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` is public and safe to expose to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- `DATABASE_URL` should point to the Supabase Postgres connection string when running migrations and ingestion against Supabase.
- Add `sslmode=require` to the Supabase database URL if the connection string does not already enforce SSL.

## Initial Setup

1. Create or select the Supabase project.
2. Set the environment variables above in the deployment platform and in local `.env.local`.
3. Apply migrations to Supabase.
4. Run historical ingestion.
5. Validate the API endpoints before shipping.

## Database Setup

Run migrations:

```bash
npm run db:migrate
```

Ingest the historical dataset:

```bash
npm run db:ingest
```

The database layer now relies on:

- `station_latest_snapshot`
- `observation_read_model`
- `get_dashboard_summary()`

These are created by `db/migrations/002_supabase_read_models.sql`.

## Runtime Checks

Verify the backend after deployment:

- `GET /api/stations`
- `GET /api/dashboard/summary`
- `GET /api/stations/:stationId/history`

Expected behavior:

- responses come from Supabase-backed read models;
- server-side errors should return a controlled JSON error and a 5xx status;
- the browser should never receive the service role key.

## Security Notes

- Do not commit `.env.local`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` restricted to server environments only.
- Do not expose the Supabase service role key in client-side code or public environment variables.
- Keep IDEAM tokens scoped to ingestion and server usage only.

## Operational Notes

- For this small project, use an hourly ingestion schedule as the default operating policy.
- If freshness becomes more important, move to every 15 minutes only after checking rate limits and run duration.
- Monitor the `ingestion_runs` table for failures and latency.
- Use `npm run db:check-ingestion` as the basic health check for the latest run, stale data, and recent failures.
- Optional environment variables for the health check:
  - `INGESTION_MAX_RUN_AGE_HOURS`
  - `INGESTION_LOOKBACK_HOURS`
  - `INGESTION_MAX_FAILURES`
  - `INGESTION_RECENT_LIMIT`
- If the schema changes, apply the next migration before the next ingestion run.
- Keep `MEMORY.md` updated after any operational or architecture change.
