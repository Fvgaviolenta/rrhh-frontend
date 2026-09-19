"use client";

import { useEffect, useState } from "react";
import PlataformaShell from "@/components/common/PlataformaShell";
import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Usuario } from "@/lib/api/usuarioService";

export default function PlataformaUsuariosPage() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiEnvelope<Usuario[]>>("/api/v1/plataforma/usuarios/pendientes")
      .then((res) => setItems(res.data.datos ?? []))
      .catch(() => setError("No se pudieron cargar los pendientes globales."));
  }, []);

  return (
    <PlataformaShell>
      <h1 className="text-2xl font-semibold">Usuarios pendientes</h1>
      <p className="mt-2 text-sm text-slate-600">
        Walk-ins de Google sin invitación previa. Asignación a un tenant se hace con el tenant destino.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <ul className="mt-6 divide-y rounded-lg border">
        {items.map((usuario) => (
          <li key={usuario.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{usuario.email}</p>
            <p className="text-slate-500">{usuario.nombre ?? "Sin nombre"} · {usuario.codigo}</p>
          </li>
        ))}
        {items.length === 0 && !error && (
          <li className="px-4 py-3 text-sm text-slate-500">No hay pendientes.</li>
        )}
      </ul>
    </PlataformaShell>
  );
}
