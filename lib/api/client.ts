import axios, { AxiosError, AxiosInstance } from "axios";
import { getEmpresaSlug } from "@/lib/auth/empresa";
import { getSession, signOut } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:8078";

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    const slug = getEmpresaSlug();
    if (slug) {
      config.headers["X-Empresa-Slug"] = slug;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        await signOut({ callbackUrl: "/ingresar" });
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createApiClient();

export interface ApiEnvelope<T> {
  codigo: number;
  mensaje: string;
  datos: T;
  errores: Array<{ campo: string; detalle: string }>;
}
