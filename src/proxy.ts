import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portfolio")) {
    const hasSessionToken =
      Boolean(request.cookies.get("authjs.session-token")?.value) ||
      Boolean(request.cookies.get("__Secure-authjs.session-token")?.value) ||
      Boolean(request.cookies.get("next-auth.session-token")?.value) ||
      Boolean(request.cookies.get("__Secure-next-auth.session-token")?.value);

    if (!hasSessionToken) {
      const signInUrl = new URL("/auth/signin", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portfolio/:path*"],
};
