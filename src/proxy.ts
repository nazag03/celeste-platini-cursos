import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountArea =
    pathname.startsWith("/cuenta") && pathname !== "/cuenta/login" && pathname !== "/cuenta/registro";

  if (isAdminArea) {
    if (!req.auth || req.auth.user?.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAccountArea) {
    if (!req.auth) {
      const loginUrl = new URL("/cuenta/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
