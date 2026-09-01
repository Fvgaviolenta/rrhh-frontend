import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pendiente = !token?.tenantId && !token?.role;
    const enPendiente = req.nextUrl.pathname.startsWith("/pendiente");

    if (pendiente && !enPendiente) {
      const url = req.nextUrl.clone();
      url.pathname = "/pendiente";
      return NextResponse.redirect(url);
    }

    if (!pendiente && enPendiente) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trabajadores/:path*",
    "/contratos/:path*",
    "/asistencia/:path*",
    "/ausencias/:path*",
    "/configuracion/:path*",
    "/pendiente",
    "/pendiente/:path*",
  ],
};
