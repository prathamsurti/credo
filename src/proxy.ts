import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const isAdmin = req.auth?.user?.role === "ADMIN";

    // Admin routes
    if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
    }

    // Protected customer routes
    const protectedRoutes = ["/account", "/checkout", "/wishlist"];
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!isLoggedIn) {
            return NextResponse.redirect(
                new URL(`/login?callbackUrl=${pathname}`, req.url)
            );
        }
        return NextResponse.next();
    }

    // Auth pages - redirect if already logged in
    if (pathname === "/login" || pathname === "/register") {
        if (isLoggedIn) {
            const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/";
            return NextResponse.redirect(new URL(callbackUrl, req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/admin/:path*",
        "/account/:path*",
        "/checkout",
        "/wishlist",
        "/login",
        "/register",
    ],
};
