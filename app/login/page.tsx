"use client";

import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { NEW_PASSWORD_CHALLENGE_KEY } from "@/lib/auth/constants";
import { EMPRESA_NOMBRE_KEY, getEmpresaSlug, PLATAFORMA_SLUG, setEmpresaContext } from "@/lib/auth/empresa";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [empresaLabel, setEmpresaLabel] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const fromQuery = searchParams.get("empresa");
    const stored = getEmpresaSlug();
    const slug = fromQuery || stored;
    if (!slug) {
      router.replace("/ingresar");
      return;
    }
    if (fromQuery) {
      setEmpresaContext(fromQuery);
    }
    setEmpresaLabel(
      sessionStorage.getItem(EMPRESA_NOMBRE_KEY) ??
        (slug === PLATAFORMA_SLUG ? "Plataforma RRHH SaaS" : slug)
    );
  }, [router, searchParams]);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "OAuthCallback" || oauthError === "Callback") {
      setFormError(
        "El callback de Cognito falló (suele ser nonce mismatch o callback URL incorrecta)."
      );
    } else if (oauthError === "OAuthSignin") {
      setFormError("No se pudo iniciar el flujo OAuth con Google. Revisa la configuración de Cognito.");
    } else if (oauthError === "CredentialsSignin") {
      setFormError("Correo o contraseña incorrectos.");
    } else if (oauthError) {
      setFormError(`Error de autenticación: ${oauthError}`);
    }
  }, [searchParams]);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/cognito/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        error?: string;
        challenge?: string;
        session?: string;
        username?: string;
        email?: string;
        idToken?: string;
        accessToken?: string;
      };

      if (!response.ok) {
        setFormError(data.error ?? "No se pudo iniciar sesión");
        setSubmitting(false);
        return;
      }

      if (data.challenge === "NEW_PASSWORD_REQUIRED" && data.session && data.username) {
        sessionStorage.setItem(
          NEW_PASSWORD_CHALLENGE_KEY,
          JSON.stringify({
            session: data.session,
            username: data.username,
            email: data.email ?? data.username,
          })
        );
        router.push("/login/nueva-contrasena");
        return;
      }

      if (!data.idToken) {
        setFormError("Cognito no devolvió un token válido.");
        setSubmitting(false);
        return;
      }

      const result = await signIn("cognito-password", {
        idToken: data.idToken,
        accessToken: data.accessToken ?? data.idToken,
        email: data.email ?? values.email,
        redirect: false,
        callbackUrl: "/sesion",
      });

      if (result?.error) {
        setFormError("No se pudo crear la sesión. Intenta de nuevo.");
        setSubmitting(false);
        return;
      }

      router.push(result?.url ?? "/sesion");
      router.refresh();
    } catch {
      setFormError("Error de red al contactar el servidor de autenticación.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Ingresar a RRHH SaaS</h1>
      <p className="mt-2 text-sm text-slate-600">
        Acceso exclusivo para <span className="font-medium text-slate-800">{empresaLabel ?? "tu empresa"}</span>.
      </p>

      {formError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <Link
              href="/login/recuperar"
              className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-slate-400 focus:ring-2 disabled:opacity-60"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wide text-slate-400">o</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton disabled={submitting} callbackUrl="/sesion" />

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link href="/ingresar" className="font-medium underline-offset-2 hover:underline">
          Cambiar de empresa
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-sm text-slate-500 shadow-sm">
            Cargando...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
