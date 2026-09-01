import { apiClient, ApiEnvelope } from "./client";

export interface Contrato {
  id: string;
  tenant_id: string;
  trabajador_id: string;
  salario_base: number;
  tipo_contrato: string;
  fecha_inicio: string;
  activo: boolean;
}

export async function listContratos(): Promise<Contrato[]> {
  const { data } = await apiClient.get<ApiEnvelope<Contrato[]>>("/api/v1/contratos");
  return data.datos ?? [];
}
