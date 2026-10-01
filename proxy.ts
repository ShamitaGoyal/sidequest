import { NextResponse, type NextRequest } from "next/server";
import { getAuthRedirect } from "@/lib/routes";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { updateSession, withSessionCookies } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Without env vars nobody can be logged in; still protect private routes instead of crashing.
  const { response, isLoggedIn } = hasSupabaseEnv()
    ? await updateSession(request)
    : { response: NextResponse.next({ request }), isLoggedIn: false };
  const { pathname, search } = request.nextUrl;

  const destination = getAuthRedirect(pathname, search, isLoggedIn);
  if (!destination) return response;

  return withSessionCookies(response, NextResponse.redirect(new URL(destination, request.url)));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
