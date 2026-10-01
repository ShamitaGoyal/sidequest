import { afterEach, describe, expect, it, vi } from "vitest";
import { AVATAR_COLORS, initials, isAvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { checkSupabaseConnection } from "@/lib/queries/health";
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";

describe("T-SETUP-03 avatar helpers", () => {
  it("has 8 swatches", () => {
    expect(AVATAR_COLORS).toHaveLength(8);
  });

  it("recognizes only known color tokens", () => {
    expect(isAvatarColor("mint-tint")).toBe(true);
    expect(isAvatarColor("blue")).toBe(false);
    expect(isAvatarColor(null)).toBe(false);
  });

  it("builds initials from first and last word", () => {
    expect(initials("maya chen")).toBe("MC");
    expect(initials("Sam")).toBe("S");
    expect(initials("  Ana  María  López ")).toBe("AL");
    expect(initials("   ")).toBe("?");
  });

  it("joins class names and skips falsy ones", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

const URL = "https://example-ref.supabase.co";

function stubEnv(url = URL, key = "test-anon-key") {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);
}

describe("T-SETUP-04 Supabase env and connection check", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports ok when the auth health endpoint answers", async () => {
    stubEnv();
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(checkSupabaseConnection(fetcher)).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      `${URL}/auth/v1/health`,
      expect.objectContaining({ headers: { apikey: "test-anon-key" } }),
    );
  });

  it.each([401, 403])("says the key was rejected on %i", async (status) => {
    stubEnv();
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status }));
    const result = await checkSupabaseConnection(fetcher);
    expect(result).toMatchObject({ ok: false, kind: "rejected" });
  });

  it("reports the status code on other error responses", async () => {
    stubEnv();
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
    await expect(checkSupabaseConnection(fetcher)).resolves.toEqual({
      ok: false,
      kind: "error",
      reason: "Supabase answered with status 503.",
    });
  });

  it("explains how to fix an unreachable project", async () => {
    stubEnv();
    const fetcher = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const result = await checkSupabaseConnection(fetcher);
    expect(result).toMatchObject({ ok: false, kind: "unreachable" });
    expect(!result.ok && "reason" in result && result.reason).toContain(".env.local");
  });

  it("lists missing env vars without calling Supabase", async () => {
    stubEnv("", "");
    const fetcher = vi.fn();
    await expect(checkSupabaseConnection(fetcher)).resolves.toEqual({
      ok: false,
      kind: "missing-env",
      missing: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("lists only the anon key when the URL is set", async () => {
    stubEnv(URL, "");
    await expect(checkSupabaseConnection(vi.fn())).resolves.toMatchObject({
      missing: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    });
  });

  it("env getters throw a setup hint when values are missing", () => {
    stubEnv("", "");
    expect(hasSupabaseEnv()).toBe(false);
    expect(() => getSupabaseUrl()).toThrow(".env.local");
    expect(() => getSupabaseAnonKey()).toThrow(".env.local");
  });

  it("env getters return the values when set", () => {
    stubEnv();
    expect(hasSupabaseEnv()).toBe(true);
    expect(getSupabaseUrl()).toBe(URL);
    expect(getSupabaseAnonKey()).toBe("test-anon-key");
  });
});
