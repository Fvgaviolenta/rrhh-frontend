export const EMPRESA_SLUG_KEY = "rrhh_empresa_slug";
export const EMPRESA_NOMBRE_KEY = "rrhh_empresa_nombre";
export const CONTEXTO_ROLE_KEY = "rrhh_role";
export const CONTEXTO_TENANT_KEY = "rrhh_tenant_id";
export const PLATAFORMA_SLUG = "plataforma";

export type VistaApp = "plataforma" | "empresa" | "trabajador" | "pendiente";

export function homeForRole(role?: string | null, pendiente?: boolean): string {
  if (pendiente || !role) {
    return "/pendiente";
  }
  if (role === "OperadorSaaS") {
    return "/plataforma";
  }
  if (role === "Trabajador") {
    return "/mi";
  }
  return "/dashboard";
}

export function vistaForRole(role?: string | null, pendiente?: boolean): VistaApp {
  if (pendiente || !role) {
    return "pendiente";
  }
  if (role === "OperadorSaaS") {
    return "plataforma";
  }
  if (role === "Trabajador") {
    return "trabajador";
  }
  return "empresa";
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function getEmpresaSlug(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return sessionStorage.getItem(EMPRESA_SLUG_KEY) ?? readCookie(EMPRESA_SLUG_KEY);
}

export function setEmpresaContext(slug: string, nombreVisible?: string) {
  sessionStorage.setItem(EMPRESA_SLUG_KEY, slug);
  if (nombreVisible) {
    sessionStorage.setItem(EMPRESA_NOMBRE_KEY, nombreVisible);
  }
  document.cookie = `${EMPRESA_SLUG_KEY}=${encodeURIComponent(slug)}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function clearEmpresaContext() {
  sessionStorage.removeItem(EMPRESA_SLUG_KEY);
  sessionStorage.removeItem(EMPRESA_NOMBRE_KEY);
  document.cookie = `${EMPRESA_SLUG_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${CONTEXTO_ROLE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${CONTEXTO_TENANT_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function isEmpresaRole(role?: string | null): boolean {
  return role === "SuperAdmin" || role === "Admin de RRHH" || role === "Jefatura";
}

/** Destino de redirección del middleware, o null si la ruta es válida para el rol. */
export function guardRedirect(
  path: string,
  role?: string | null,
  pendiente?: boolean
): string | null {
  const enPendiente = path.startsWith("/pendiente");
  const enPlataforma = path.startsWith("/plataforma");
  const enTrabajador = path.startsWith("/mi");
  const enSesion = path.startsWith("/sesion");

  if (enSesion) {
    return null;
  }
  if (pendiente && !enPendiente) {
    return "/pendiente";
  }
  if (!pendiente && enPendiente) {
    return homeForRole(role, false);
  }
  if (role === "OperadorSaaS" && !enPlataforma) {
    return "/plataforma";
  }
  if (role === "Trabajador" && !enTrabajador) {
    return "/mi";
  }
  if (role && role !== "OperadorSaaS" && enPlataforma) {
    return role === "Trabajador" ? "/mi" : "/dashboard";
  }
  if (role && role !== "Trabajador" && enTrabajador) {
    return role === "OperadorSaaS" ? "/plataforma" : "/dashboard";
  }
  return null;
}
