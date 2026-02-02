import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // ✅ PUBLIC ROUTES
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login")
  ) {
    return NextResponse.next();
  }

  // ❌ NEVER TOUCH API ROUTES
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 🔐 PROTECTED UI ROUTES
  const protectedRoutes = [
    "/superadmin",
    "/principal",
    "/teacher",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/principal/:path*",
    "/teacher/:path*",
  ],
};
