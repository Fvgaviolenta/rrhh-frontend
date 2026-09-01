"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import { listContratos, Contrato } from "@/lib/api/contratoService";

export default function ContratosPage() {
  const [items, setItems] = useState<Contrato[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContratos()
      .then(setItems)
      .catch(() => setError("No se pudo cargar contratos. Verifique permisos y gateway."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Contratos</h1>
      {loading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-4">Trabajador</th>
                <th className="py-2 pr-4">Salario base</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 pr-4">{c.trabajador_id}</td>
                  <td className="py-2 pr-4">${c.salario_base.toLocaleString("es-CL")}</td>
                  <td className="py-2 pr-4">{c.tipo_contrato}</td>
                  <td className="py-2">{c.activo ? "Activo" : "Finalizado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
