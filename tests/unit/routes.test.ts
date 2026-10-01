import { describe, expect, it } from "vitest";
import { getAuthRedirect, isAuthOnlyRoute, isPublicRoute } from "@/lib/routes";

describe("T-SETUP-01 route protection rules", () => {
  it.each(["/", "/login", "/signup", "/forgot-password", "/reset-password", "/demo", "/join/K7MP2Q", "/auth/callback"])(
    "%s is public",
    (path) => {
      expect(isPublicRoute(path)).toBe(true);
    },
  );

  it.each(["/home", "/g/123", "/q/456", "/profile", "/settings", "/groups/new", "/onboarding", "/loginx", "/join"])(
    "%s is private",
    (path) => {
      expect(isPublicRoute(path)).toBe(false);
    },
  );

  it("ignores a trailing slash", () => {
    expect(isPublicRoute("/login/")).toBe(true);
    expect(isAuthOnlyRoute("/signup/")).toBe(true);
  });

  it("sends logged-out visitors on private routes to /login with the return path", () => {
    expect(getAuthRedirect("/g/123", "?tab=past", false)).toBe("/login?next=%2Fg%2F123%3Ftab%3Dpast");
  });

  it("lets logged-out visitors through on public routes", () => {
    expect(getAuthRedirect("/", "", false)).toBeNull();
    expect(getAuthRedirect("/login", "", false)).toBeNull();
  });

  it("sends logged-in users away from /login and /signup", () => {
    expect(getAuthRedirect("/login", "", true)).toBe("/home");
    expect(getAuthRedirect("/signup", "", true)).toBe("/home");
  });

  it("lets logged-in users through everywhere else", () => {
    expect(getAuthRedirect("/home", "", true)).toBeNull();
    expect(getAuthRedirect("/", "", true)).toBeNull();
  });
});
