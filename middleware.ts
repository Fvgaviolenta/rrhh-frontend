import { CONTEXTO_ROLE_KEY, guardRedirect } from "@/lib/auth/empresa";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function resolveRole(req: { cookies: { get: (name: string) => { value: string } | undefined }; nextauth: { token?: { role?: string; tenantId?: string } | null } }) {
  return req.nextauth.token?.role || req.cookies.get(CONTEXTO_ROLE_KEY)?.value;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = resolveRole(req);
    const pendiente = !token?.tenantId && !role;
    const destino = guardRedirect(req.nextUrl.pathname, role, pendiente);
    if (destino) {
      const url = req.nextUrl.clone();
      url.pathname = destino;
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
    "/plataforma/:path*",
    "/plataforma",
    "/mi/:path*",
    "/mi",
    "/sesion",
  ],
};
