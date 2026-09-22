/**
 * Resuelve un nombre visible desde claims de Cognito/Google.
 * Orden: name → given_name + family_name.
 * No inventa nombre desde el email: si no hay claim, el UI muestra solo el correo.
 */
export function resolveDisplayName(
  source?: Record<string, unknown> | null
): string | undefined {
  if (!source) return undefined;

  const name = asNonEmpty(source.name);
  if (name) return name;

  const given = asNonEmpty(source.given_name);
  const family = asNonEmpty(source.family_name);
  const combined = [given, family].filter(Boolean).join(" ").trim();
  if (combined) return combined;

  return undefined;
}

export function asNonEmpty(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Decodifica el payload de un JWT sin verificar firma (solo lectura de claims). */
export function decodeJwtClaims(token?: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(normalized, "base64").toString("utf8")
        : atob(normalized);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
