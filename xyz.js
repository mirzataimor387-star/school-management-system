// middleware

// middleware.js

import { NextResponse } from "next/server";
import { verifyToken } from "./utils/jwt";

export function middleware(req) {
    const token = req.cookies.get("token")?.value;
    const path = req.nextUrl.pathname;

    // 🔒 not logged in
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const user = verifyToken(token);

        // 🔴 super admin
        if (
            path.startsWith("/superadmin") &&
            user.role !== "superadmin"
        ) {
            return NextResponse.redirect(
                new URL("/unauthorized", req.url)
            );
        }

        // 🔵 principal
        if (
            path.startsWith("/principal") &&
            user.role !== "principal"
        ) {
            return NextResponse.redirect(
                new URL("/unauthorized", req.url)
            );
        }

        // 🟢 teacher
        if (
            path.startsWith("/teacher") &&
            user.role !== "teacher"
        ) {
            return NextResponse.redirect(
                new URL("/unauthorized", req.url)
            );
        }

        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/superadmin/:path*",
        "/principal/:path*",
        "/teacher/:path*",
    ],
};
