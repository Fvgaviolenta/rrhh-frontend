"use client";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    const fromStorage =
      typeof window !== "undefined" ? sessionStorage.getItem("rrhh_reset_email") : null;
    const email = fromQuery || fromStorage || "";
    if (email) {
      setValue("email", email);
    }
  }, [searchParams, setValue]);

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/cognito/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo restablecer la contraseña");
        setSubmitting(false);
        return;
      }

      setInfo(data.message ?? "Contraseña actualizada.");
      sessionStorage.removeItem("rrhh_reset_email");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Error de red al restablecer la contraseña.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Restablecer contraseña</h1>
      <p className="mt-2 text-sm text-slate-600">
        Ingresa el código que recibiste por correo y define una nueva contraseña.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {info && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {info}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-slate-400 focus:ring-2 disabled:opacity-60"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-700">
            Código de verificación
          </label>
          <input
            id="code"
            type="text"
            autoComplete="one-time-code"
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-slate-400 focus:ring-2 disabled:opacity-60"
            {...register("code")}
          />
          {errors.code && (
            <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-slate-400 focus:ring-2 disabled:opacity-60"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-slate-400 focus:ring-2 disabled:opacity-60"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link href="/login" className="font-medium underline-offset-2 hover:underline">
          Volver al login
        </Link>
      </p>
    </div>
  );
}

export default function RestablecerPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-sm text-slate-500 shadow-sm">
            Cargando...
          </div>
        }
      >
        <RestablecerForm />
      </Suspense>
    </div>
  );
}
