"use client";

import { fetchMeServer } from "@/lib/api/authService";
import { EMPRESA_NOMBRE_KEY, getEmpresaSlug, homeForRole } from "@/lib/auth/empresa";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SesionRouterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated" || !session?.accessToken) {
      router.replace("/ingresar");
      return;
    }

    const slug = getEmpresaSlug();
    if (!slug) {
      router.replace("/ingresar");
      return;
    }

    let cancelled = false;
    (async () => {
      const me = await fetchMeServer(session.accessToken as string, slug);
      if (cancelled) {
        return;
      }
      if (!me.ok) {
        setError(me.mensaje);
        return;
      }
      if (me.data.tenant_slug && me.data.tenant_slug !== slug && !me.data.pendiente) {
        setError("Esta cuenta no pertenece a la empresa que seleccionaste.");
        return;
      }
      await fetch("/api/auth/contexto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: me.data.role,
          tenantId: me.data.tenant_id,
        }),
      });
      router.replace(homeForRole(me.data.role, me.data.pendiente));
    })();

    return () => {
      cancelled = true;
    };
  }, [router, session, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-sm text-slate-600 shadow-sm">
        {error ? (
          <div>
            <p className="text-red-700">{error}</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white"
              onClick={() => signOut({ callbackUrl: "/ingresar" })}
            >
              Volver a ingresar
            </button>
          </div>
        ) : (
          <p>Validando tu acceso a {sessionStorage.getItem(EMPRESA_NOMBRE_KEY) ?? "la empresa"}...</p>
        )}
      </div>
    </div>
  );
}
