import { apiClient, ApiEnvelope } from "./client";

export interface Usuario {
  id: string;
  codigo: string | null;
  tenant_id: string | null;
  email: string;
  nombre: string | null;
  rol: string | null;
  trabajador_id: string | null;
  cognito_sub: string | null;
  estado: string | null;
  activo: boolean;
}

export type RolAsignable = "SuperAdmin" | "Admin de RRHH" | "Jefatura" | "Trabajador";

export async function listUsuariosPendientes(): Promise<Usuario[]> {
  const { data } = await apiClient.get<ApiEnvelope<Usuario[]>>("/api/v1/usuarios/pendientes");
  return data.datos ?? [];
}

export async function invitarTrabajador(email: string, nombre?: string): Promise<Usuario> {
  const { data } = await apiClient.post<ApiEnvelope<Usuario>>("/api/v1/usuarios/invitar", {
    email,
    nombre: nombre || null,
  });
  return data.datos;
}

export async function asignarUsuario(
  usuarioId: string,
  rol: RolAsignable,
  trabajadorId?: string
): Promise<Usuario> {
  const { data } = await apiClient.post<ApiEnvelope<Usuario>>(
    `/api/v1/usuarios/${usuarioId}/asignar`,
    { rol, trabajadorId: trabajadorId || null }
  );
  return data.datos;
}
