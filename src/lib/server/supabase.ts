import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  var __ideamSupabase: SupabaseClient | undefined;
}

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return value;
}

function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return value;
}

export function getSupabaseServerClient() {
  if (!global.__ideamSupabase) {
    global.__ideamSupabase = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return global.__ideamSupabase;
}
