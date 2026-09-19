import { CONTEXTO_ROLE_KEY, CONTEXTO_TENANT_KEY } from "@/lib/auth/empresa";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { role?: string; tenantId?: string | null };
  const response = NextResponse.json({ ok: true });
  if (body.role) {
    response.cookies.set(CONTEXTO_ROLE_KEY, body.role, {
      path: "/",
      maxAge: 60 * 60 * 8,
      sameSite: "lax",
    });
  }
  if (body.tenantId) {
    response.cookies.set(CONTEXTO_TENANT_KEY, body.tenantId, {
      path: "/",
      maxAge: 60 * 60 * 8,
      sameSite: "lax",
    });
  }
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONTEXTO_ROLE_KEY, "", { path: "/", maxAge: 0 });
  response.cookies.set(CONTEXTO_TENANT_KEY, "", { path: "/", maxAge: 0 });
  return response;
}
