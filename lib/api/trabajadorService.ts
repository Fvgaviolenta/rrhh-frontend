import { apiClient, ApiEnvelope } from "./client";

export interface Trabajador {
  id: string;
  tenant_id: string;
  nombre: string;
  apellido: string;
  rut_trabajador: string;
  email: string;
  activo: boolean;
}

export async function listTrabajadores(): Promise<Trabajador[]> {
  const { data } = await apiClient.get<ApiEnvelope<Trabajador[]>>("/api/v1/trabajadores");
  return data.datos ?? [];
}
