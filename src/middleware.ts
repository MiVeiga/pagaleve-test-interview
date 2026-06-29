import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { isAuthTokenValid } from "@/features/auth/utils/jwt";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function getValidAuthToken(request: NextRequest): string | undefined {
  const rawToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!rawToken) {
    return undefined;
  }

  try {
    const token = decodeURIComponent(rawToken);
    return isAuthTokenValid(token) ? token : undefined;
  } catch {
    return undefined;
  }
}

function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = getValidAuthToken(request);
  const isPublic = isPublicPath(pathname);
  const hasInvalidCookie =
    Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value) && !token;

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);

    if (hasInvalidCookie) {
      clearAuthCookie(response);
    }

    return response;
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (hasInvalidCookie && isPublic) {
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
