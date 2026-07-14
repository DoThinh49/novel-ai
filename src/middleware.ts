import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Nếu tài khoản bị khóa (BANNED)
    if (token && token.status === "BANNED") {
      return NextResponse.redirect(new URL("/login?error=BannedUser", req.url));
    }

    // Nếu cố truy cập route /admin mà không có quyền ADMIN
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Chỉ định các route cần bắt buộc đăng nhập mới được truy cập
export const config = {
  matcher: [
    "/projects/:path*",
    "/create/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/projects/:path*",
    "/api/generate/:path*",
  ],
};
