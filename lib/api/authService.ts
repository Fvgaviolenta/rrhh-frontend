import { apiClient, ApiEnvelope } from "./client";

export interface AuthMe {
  user_id: string;
  email: string;
  nombre?: string | null;
  tenant_id: string | null;
  role: string | null;
  trabajador_id?: string | null;
  cognito_sub?: string | null;
  estado?: string | null;
  codigo?: string | null;
  pendiente?: boolean;
}

export type FetchMeResult =
  | { ok: true; data: AuthMe }
  | { ok: false; status: number; mensaje: string };

export async function fetchMe(): Promise<AuthMe> {
  const { data } = await apiClient.get<ApiEnvelope<AuthMe>>("/api/v1/auth/me");
  return data.datos;
}

/**
 * Llama a GET /api/v1/auth/me vía gateway.
 * Es el punto que dispara la auto-provisión PENDIENTE en identity.
 */
export async function fetchMeServer(accessToken: string): Promise<FetchMeResult> {
  const baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:8078";
  try {
    const response = await fetch(`${baseURL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        mensaje:
          response.status === 401 || response.status === 403
            ? `Identity rechazó el token (HTTP ${response.status}). Verifica perfil Spring (local/cognito) y COGNITO_ISSUER.`
            : `No se pudo registrar el usuario en identity (HTTP ${response.status}). Revisa gateway :8078 e identity :8081.`,
      };
    }
    const data = (await response.json()) as ApiEnvelope<AuthMe>;
    if (!data?.datos) {
      return {
        ok: false,
        status: response.status,
        mensaje: "La respuesta de /auth/me no incluye datos de usuario.",
      };
    }
    return { ok: true, data: data.datos };
  } catch {
    return {
      ok: false,
      status: 0,
      mensaje:
        "No hay conexión con el gateway. Asegúrate de tener rrhh-gateway en :8078 y rrhh-identity en :8081.",
    };
  }
}
