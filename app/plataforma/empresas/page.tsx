"use client";

import { useEffect, useState } from "react";
import PlataformaShell from "@/components/common/PlataformaShell";
import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { TenantResumen } from "@/lib/api/tenantService";

export default function PlataformaEmpresasPage() {
  const [items, setItems] = useState<TenantResumen[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<TenantResumen[]>>("/api/v1/plataforma/tenants")
      .then((res) => setItems(res.data.datos ?? []))
      .catch(() => setError("No se pudieron cargar las empresas."));
  }, []);

  return (
    <PlataformaShell>
      <h1 className="text-2xl font-semibold">Empresas cliente</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <ul className="mt-6 divide-y rounded-lg border">
        {items.map((empresa) => (
          <li key={empresa.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{empresa.nombre_empresa}</p>
            <p className="text-slate-500">slug: {empresa.slug}</p>
          </li>
        ))}
        {items.length === 0 && !error && (
          <li className="px-4 py-3 text-sm text-slate-500">No hay empresas cliente.</li>
        )}
      </ul>
    </PlataformaShell>
  );
}
