import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      // Thin wrappers around @supabase/ssr and next/headers; exercised against real Supabase in later features.
      exclude: ["lib/supabase/client.ts", "lib/supabase/server.ts", "lib/supabase/middleware.ts", "lib/supabase/admin.ts"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
