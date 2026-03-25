import "server-only";

import { Pool, PoolClient } from "pg";

declare global {
  var __ideamPool: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

export function getPool() {
  if (!global.__ideamPool) {
    global.__ideamPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return global.__ideamPool;
}

export async function withClient<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}
