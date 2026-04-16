import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect portfolio routes
  if (pathname.startsWith("/portfolio")) {
    const session = await auth();

    if (!session?.user) {
      // Redirect to signin
      const signInUrl = new URL("/auth/signin", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portfolio/:path*"],
};
