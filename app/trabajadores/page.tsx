"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import { listTrabajadores, Trabajador } from "@/lib/api/trabajadorService";

export default function TrabajadoresPage() {
  const [items, setItems] = useState<Trabajador[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTrabajadores()
      .then(setItems)
      .catch(() => setError("No se pudo cargar trabajadores. Verifique gateway y token."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Trabajadores</h1>
      {loading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">RUT</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2 pr-4">{t.nombre} {t.apellido}</td>
                  <td className="py-2 pr-4">{t.rut_trabajador}</td>
                  <td className="py-2 pr-4">{t.email}</td>
                  <td className="py-2">{t.activo ? "Activo" : "Inactivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
