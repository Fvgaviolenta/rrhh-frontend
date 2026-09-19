import { ApiEnvelope } from "./client";

export interface TenantResolver {
  existe: boolean;
  slug: string;
  nombre_visible: string;
}

export interface TenantResumen {
  id: string;
  nombre_empresa: string;
  slug: string;
  activo: boolean;
}

const baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:8078";

export async function resolverEmpresa(nombre: string): Promise<TenantResolver> {
  const url = `${baseURL}/api/v1/tenants/resolver?nombre=${encodeURIComponent(nombre)}`;
  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as ApiEnvelope<TenantResolver>;
  if (!response.ok || !body.datos) {
    throw new Error(body.mensaje ?? "La empresa no se encuentra en nuestra base de datos");
  }
  return body.datos;
}
