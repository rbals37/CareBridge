import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE, verifyToken } from "@/lib/jwt";

const PUBLIC_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isPublic = PUBLIC_PAGES.includes(pathname);

  console.log(`[Middleware] Pathname: ${pathname}, Token present: ${!!token}`);

  if (isPublic) {
    if (token) {
      try {
        const payload = await verifyToken(token);
        console.log(`[Middleware] Public page, valid token. Redirecting to / for user: ${payload.email}`);
        return NextResponse.redirect(new URL("/", request.url));
      } catch (e) {
        console.log("[Middleware] Public page, invalid token. Error:", e);
        /* invalid token — show login/signup */
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    console.log(`[Middleware] Protected page, no token. Redirecting to /login from ${pathname}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyToken(token);
    console.log(`[Middleware] Protected page, valid token for user: ${payload.email}`);
    return NextResponse.next();
  } catch (e) {
    console.log("[Middleware] Protected page, invalid token. Redirecting to /login. Error:", e);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
