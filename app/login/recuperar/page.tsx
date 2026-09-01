"use client";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/cognito/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo enviar el código");
        setSubmitting(false);
        return;
      }

      setInfo(data.message ?? "Revisa tu correo para el código de verificación.");
      sessionStorage.setItem("rrhh_reset_email", values.email);
      setTimeout(() => {
        router.push(`/login/restablecer?email=${encodeURIComponent(values.email)}`);
      }, 800);
    } catch {
      setError("Error de red al solicitar el código.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa tu correo y te enviaremos un código para restablecer la contraseña.
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium underline-offset-2 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
