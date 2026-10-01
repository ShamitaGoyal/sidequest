// NEXT_PUBLIC_ values must be read with literal property access so Next can inline them in the browser bundle.

const SETUP_HINT = "Copy .env.example to .env.local and fill in your hosted project's values.";

export function getMissingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}

export function hasSupabaseEnv(): boolean {
  return getMissingSupabaseEnv().length === 0;
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error(`NEXT_PUBLIC_SUPABASE_URL is not set. ${SETUP_HINT}`);
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error(`NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ${SETUP_HINT}`);
  return key;
}
