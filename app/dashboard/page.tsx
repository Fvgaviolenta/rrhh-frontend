import AppShell from "@/components/common/AppShell";
import { fetchMeServer } from "@/lib/api/authService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const meResult = session?.accessToken ? await fetchMeServer(session.accessToken) : null;
  const profile = meResult?.ok ? meResult.data : null;

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        Bienvenido. Sesión activa vía Cognito y consumo protegido del gateway.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-xs uppercase text-slate-500">Usuario</p>
          <p className="font-medium">{session?.user?.email ?? "—"}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs uppercase text-slate-500">Rol</p>
          <p className="font-medium">{profile?.role ?? session?.role ?? "—"}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs uppercase text-slate-500">Tenant</p>
          <p className="font-medium">{profile?.tenant_id ?? session?.tenantId ?? "—"}</p>
        </div>
      </div>
    </AppShell>
  );
}
