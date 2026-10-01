import { getMissingSupabaseEnv, getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export type ConnectionStatus =
  | { ok: true }
  | { ok: false; kind: "missing-env"; missing: string[] }
  | { ok: false; kind: "rejected" | "unreachable" | "error"; reason: string };

/** Harmless read with the anon key: Supabase Auth's health endpoint. Never logs key values. */
export async function checkSupabaseConnection(fetcher: typeof fetch = fetch): Promise<ConnectionStatus> {
  const missing = getMissingSupabaseEnv();
  if (missing.length > 0) return { ok: false, kind: "missing-env", missing };

  const url = getSupabaseUrl();
  try {
    const response = await fetcher(`${url}/auth/v1/health`, {
      headers: { apikey: getSupabaseAnonKey() },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        kind: "rejected",
        reason: "Supabase rejected the key. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      };
    }
    if (!response.ok) {
      return { ok: false, kind: "error", reason: `Supabase answered with status ${response.status}.` };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      kind: "unreachable",
      reason: "Couldn't reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local and that the project isn't paused.",
    };
  }
}
