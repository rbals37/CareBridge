import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE, verifyToken } from "@/lib/jwt";
import { COOKIE_OPTIONS } from "@/lib/cookies";

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

  if (isPublic) {
    if (token) {
      try {
        await verifyToken(token);
        return NextResponse.redirect(new URL("/", request.url));
      } catch {
        /* invalid token */
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set(TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
