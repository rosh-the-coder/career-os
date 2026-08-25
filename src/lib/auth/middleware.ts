import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDevAuthBypass, isSupabaseConfigured } from "@/lib/auth/supabase";

const PUBLIC_PATHS = ["/", "/login", "/request-access", "/auth/callback", "/auth/signout"];

function withPathHeader(request: NextRequest, path: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  return requestHeaders;
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.includes(path) ||
    PUBLIC_PATHS.some((p) => p !== "/" && path.startsWith(`${p}/`));
  const requestHeaders = withPathHeader(request, path);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isDevAuthBypass() || !isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: withPathHeader(request, path) },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (path !== "/") url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Allow visiting /login while signed in so users can switch accounts.
  // Only auto-bounce away from marketing home.
  if (user && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
