export const ADMIN_ROLES = ["SuperAdmin", "Admin de RRHH"] as const;
export const EMPRESA_ROLES = ["SuperAdmin", "Admin de RRHH", "Jefatura"] as const;

export function canManageUsers(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function canViewSalaries(role?: string | null): boolean {
  return !!role && [...ADMIN_ROLES, "Trabajador"].includes(role);
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  if (!payload) return {};
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json =
    typeof window === "undefined"
      ? Buffer.from(normalized, "base64").toString("utf8")
      : atob(normalized);
  return JSON.parse(json) as Record<string, unknown>;
}
