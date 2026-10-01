// Route classification used by proxy.ts. Anything not listed here is private.

export const LOGIN_PATH = "/login";
export const HOME_PATH = "/home";

const PUBLIC_EXACT = new Set(["/", "/login", "/signup", "/forgot-password", "/reset-password", "/demo", "/ui-kit"]);

const PUBLIC_PREFIXES = ["/join/", "/auth/"];

const AUTH_ONLY = new Set(["/login", "/signup"]);

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function isPublicRoute(pathname: string): boolean {
  const path = normalize(pathname);
  return PUBLIC_EXACT.has(path) || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY.has(normalize(pathname));
}

/** Where to send the visitor, or null to let the request through. */
export function getAuthRedirect(pathname: string, search: string, isLoggedIn: boolean): string | null {
  if (isLoggedIn && isAuthOnlyRoute(pathname)) return HOME_PATH;
  if (!isLoggedIn && !isPublicRoute(pathname)) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return `${LOGIN_PATH}?next=${next}`;
  }
  return null;
}
