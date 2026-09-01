import LogoutButton from "@/components/auth/LogoutButton";
import { fetchMeServer } from "@/lib/api/authService";
import { asNonEmpty } from "@/lib/auth/displayName";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function PendientePage() {
  const session = await getServerSession(authOptions);
  const meResult = session?.accessToken
    ? await fetchMeServer(session.accessToken)
    : { ok: false as const, status: 0, mensaje: "No hay token de sesión para registrar el usuario en identity." };

  const perfil = meResult.ok ? meResult.data : null;
  const persistido = Boolean(perfil?.codigo);
  const errorPersistencia = !meResult.ok ? meResult.mensaje : null;

  const nombre =
    asNonEmpty(perfil?.nombre) ??
    asNonEmpty(session?.user?.name) ??
    null;
  const correo =
    asNonEmpty(perfil?.email) ??
    asNonEmpty(session?.user?.email) ??
    "correo desconocido";
  const codigo = asNonEmpty(perfil?.codigo) ?? null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Cuenta pendiente de asignación</h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {nombre ? (
            <>
              Ingresado con cuenta: <span className="font-medium">{nombre}</span> y correo:{" "}
              <span className="font-medium">{correo}</span>
            </>
          ) : (
            <>
              Ingresado con correo: <span className="font-medium">{correo}</span>
            </>
          )}
          , pero tu cuenta no se encuentra asociada a ningún tenant ni rol, espera a que un
          administrador te los asigne.
        </p>

        {errorPersistencia && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            No se pudo registrar tu usuario en la base de datos. {errorPersistencia}
          </p>
        )}

        {!errorPersistencia && !persistido && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            La sesión de Cognito está activa, pero identity no devolvió un código de usuario
            (`USR-...`). Sin ese código no hay evidencia de persistencia en{" "}
            <code className="rounded bg-amber-100 px-1">identity_usuario</code>.
          </p>
        )}

        {codigo && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Código de usuario:{" "}
            <span className="font-mono font-medium text-slate-700">{codigo}</span>
            <span className="ml-2 text-green-700">(registrado en BD)</span>
          </p>
        )}

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
