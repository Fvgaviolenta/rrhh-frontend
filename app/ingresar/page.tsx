"use client";

import { setEmpresaContext } from "@/lib/auth/empresa";
import { resolverEmpresa } from "@/lib/api/tenantService";
import { empresaIngresoSchema, type EmpresaIngresoValues } from "@/lib/schemas/empresaSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function IngresarEmpresaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaIngresoValues>({
    resolver: zodResolver(empresaIngresoSchema),
    defaultValues: { nombre: "" },
  });

  async function onSubmit(values: EmpresaIngresoValues) {
    setError(null);
    setSubmitting(true);
    try {
      const empresa = await resolverEmpresa(values.nombre);
      setEmpresaContext(empresa.slug, empresa.nombre_visible);
      router.push(`/login?empresa=${encodeURIComponent(empresa.slug)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "La empresa no se encuentra en nuestra base de datos"
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">¿A qué empresa ingresas?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escribe el nombre con el que tu empresa está registrada en RRHH SaaS.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {error}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
              Nombre de la empresa
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="organization"
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-slate-400 focus:ring-2 disabled:opacity-60"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Verificando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
