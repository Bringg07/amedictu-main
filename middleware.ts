import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Proteksi role-based & Auto-redirection
    const isLoginPage = path.endsWith("/login");
    
    if (path.startsWith("/pasien")) {
      if (!token && !isLoginPage) return NextResponse.redirect(new URL("/login", req.url));
      if (!isLoginPage && token?.role === "tenaga_medis") return NextResponse.redirect(new URL("/medis/dashboard", req.url));
      if (!isLoginPage && token?.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (path.startsWith("/medis")) {
      if (!token && !isLoginPage) return NextResponse.redirect(new URL("/medis/login", req.url));
      if (!isLoginPage && token?.role === "pasien") return NextResponse.redirect(new URL("/pasien/dashboard", req.url));
      if (!isLoginPage && token?.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (path.startsWith("/admin")) {
      if (!token && !isLoginPage) return NextResponse.redirect(new URL("/admin/login", req.url));
      if (!isLoginPage && token?.role === "pasien") return NextResponse.redirect(new URL("/pasien/dashboard", req.url));
      if (!isLoginPage && token?.role === "tenaga_medis") return NextResponse.redirect(new URL("/medis/dashboard", req.url));
    }



    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Biarkan fungsi middleware di atas yang menangani redirect
    },
  }
);


export const config = {
  matcher: ["/pasien/:path*", "/medis/:path*", "/admin/:path*"],
};
