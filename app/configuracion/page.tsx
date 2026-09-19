"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AppShell from "@/components/common/AppShell";
import { canManageUsers } from "@/lib/utils/roles";
import {
  asignarUsuario,
  invitarTrabajador,
  listUsuariosPendientes,
  RolAsignable,
  Usuario,
} from "@/lib/api/usuarioService";

const ROLES: RolAsignable[] = ["SuperAdmin", "Admin de RRHH", "Jefatura", "Trabajador"];

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  const isAdmin = canManageUsers(session?.role);

  const [pendientes, setPendientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Record<string, RolAsignable>>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitando, setInvitando] = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    setError(null);
    listUsuariosPendientes()
      .then(setPendientes)
      .catch(() => setError("No se pudieron cargar los usuarios pendientes. Verifique gateway y permisos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAdmin) {
      cargar();
    } else {
      setLoading(false);
    }
  }, [isAdmin, cargar]);

  async function handleAsignar(usuario: Usuario) {
    const rol = seleccion[usuario.id];
    if (!rol) {
      setError("Selecciona un rol antes de asignar.");
      return;
    }
    setEnviando(usuario.id);
    setError(null);
    setMensaje(null);
    try {
      await asignarUsuario(usuario.id, rol);
      setMensaje(`Se asignó ${rol} a ${usuario.email}.`);
      cargar();
    } catch {
      setError("No se pudo asignar el usuario.");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <p className="mt-2 text-sm text-slate-600">
        Ajustes de tenant y asignación de usuarios que ingresaron con Google.
      </p>

      {!isAdmin && (
        <p className="mt-6 text-sm text-slate-500">
          Solo un Admin de RRHH o SuperAdmin puede asignar usuarios pendientes.
        </p>
      )}

      {isAdmin && (
        <section className="mt-6 rounded-lg border p-4">
          <h2 className="text-lg font-medium">Invitar trabajador por correo</h2>
          <p className="mt-1 text-sm text-slate-600">
            Si el trabajador entra con Google en el login de esta empresa, se reconocerá y irá a su vista.
          </p>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              setInvitando(true);
              setError(null);
              setMensaje(null);
              try {
                await invitarTrabajador(inviteEmail);
                setMensaje(`Se invitó a ${inviteEmail}.`);
                setInviteEmail("");
              } catch {
                setError("No se pudo invitar el correo. Verifica que no exista en otra empresa.");
              } finally {
                setInvitando(false);
              }
            }}
          >
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="trabajador@empresa.cl"
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={invitando}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {invitando ? "Invitando..." : "Invitar"}
            </button>
          </form>
        </section>
      )}

      {isAdmin && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Usuarios pendientes de asignación</h2>
            <button
              type="button"
              onClick={cargar}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-100"
            >
              Actualizar
            </button>
          </div>

          {mensaje && <p className="mt-4 text-sm text-green-600">{mensaje}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {loading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}

          {!loading && pendientes.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">No hay usuarios pendientes.</p>
          )}

          {!loading && pendientes.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-2 pr-4">Código</th>
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Rol a asignar</th>
                    <th className="py-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientes.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 pr-4 font-mono text-xs">{u.codigo ?? "—"}</td>
                      <td className="py-2 pr-4">{u.nombre ?? "—"}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">
                        <select
                          value={seleccion[u.id] ?? ""}
                          onChange={(e) =>
                            setSeleccion((prev) => ({
                              ...prev,
                              [u.id]: e.target.value as RolAsignable,
                            }))
                          }
                          className="rounded-md border px-2 py-1 text-sm"
                        >
                          <option value="" disabled>
                            Selecciona rol
                          </option>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          disabled={enviando === u.id}
                          onClick={() => handleAsignar(u)}
                          className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {enviando === u.id ? "Asignando..." : "Asignar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Nota: la asignación se guarda en la base de datos. Para que el tenant y rol viajen en el
            JWT del usuario, se deben actualizar sus atributos <code>custom:</code> en Cognito.
          </p>
        </section>
      )}
    </AppShell>
  );
}
