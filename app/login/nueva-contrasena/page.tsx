"use client";

import { NEW_PASSWORD_CHALLENGE_KEY } from "@/lib/auth/constants";
import {
  newPasswordSchema,
  type NewPasswordFormValues,
} from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type ChallengePayload = {
  session: string;
  username: string;
  email: string;
};

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<ChallengePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(NEW_PASSWORD_CHALLENGE_KEY);
      if (!raw) {
        router.replace("/login");
        return;
      }
      setChallenge(JSON.parse(raw) as ChallengePayload);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  async function onSubmit(values: NewPasswordFormValues) {
    if (!challenge) return;
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/cognito/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: challenge.username,
          session: challenge.session,
          newPassword: values.newPassword,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        idToken?: string;
        accessToken?: string;
        email?: string;
      };

      if (!response.ok || !data.idToken) {
        setError(data.error ?? "No se pudo actualizar la contraseña");
        setSubmitting(false);
        return;
      }

      sessionStorage.removeItem(NEW_PASSWORD_CHALLENGE_KEY);

      const result = await signIn("cognito-password", {
        idToken: data.idToken,
        accessToken: data.accessToken ?? data.idToken,
        email: data.email ?? challenge.email,
        redirect: false,
        callbackUrl: "/sesion",
      });

      if (result?.error) {
        setError("Contraseña actualizada, pero no se pudo crear la sesión. Ingresa de nuevo.");
        setSubmitting(false);
        router.push("/login");
        return;
      }

      router.push(result?.url ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Error de red al actualizar la contraseña.");
      setSubmitting(false);
    }
  }

  if (!challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-sm text-slate-500 shadow-sm">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Define tu contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tu cuenta requiere una nueva contraseña antes de continuar ({challenge.email}).
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            {submitting ? "Guardando..." : "Continuar"}
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
