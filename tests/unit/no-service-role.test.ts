// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const BROWSER_REACHABLE_DIRS = ["app", "components"];
const FORBIDDEN_IN_BROWSER_CODE = [/SERVICE_ROLE/i, /service_role/i, /lib\/supabase\/admin/];
const PUBLIC_SECRET = /NEXT_PUBLIC_\w*(SERVICE|SECRET)/i;

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

describe("T-SETUP-02 service role key stays out of browser code", () => {
  it.each(BROWSER_REACHABLE_DIRS)("no file under %s/ mentions the service role key or admin client", (dir) => {
    const offenders = listFiles(join(ROOT, dir)).filter((file) => {
      const source = readFileSync(file, "utf8");
      return FORBIDDEN_IN_BROWSER_CODE.some((pattern) => pattern.test(source));
    });
    expect(offenders).toEqual([]);
  });

  it("no NEXT_PUBLIC_ variable names a service or secret key", () => {
    const files = [
      ...["app", "components", "lib", "scripts"].flatMap((dir) => listFiles(join(ROOT, dir))),
      join(ROOT, ".env.example"),
    ].filter(existsSync);
    const offenders = files.filter((file) => PUBLIC_SECRET.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it(".env.example lists only the three placeholder names, with no values", () => {
    const lines = readFileSync(join(ROOT, ".env.example"), "utf8").split("\n").filter(Boolean);
    expect(lines).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL=",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
      "SUPABASE_SERVICE_ROLE_KEY=",
    ]);
  });
});
