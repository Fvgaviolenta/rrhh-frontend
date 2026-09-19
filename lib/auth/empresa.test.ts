import { describe, expect, it } from "vitest";
import { guardRedirect, homeForRole, vistaForRole } from "./empresa";

describe("homeForRole", () => {
  it("envía OperadorSaaS a /plataforma", () => {
    expect(homeForRole("OperadorSaaS")).toBe("/plataforma");
  });

  it("envía Trabajador a /mi", () => {
    expect(homeForRole("Trabajador")).toBe("/mi");
  });

  it("envía Admin de RRHH al dashboard de empresa", () => {
    expect(homeForRole("Admin de RRHH")).toBe("/dashboard");
  });

  it("envía pendiente a /pendiente", () => {
    expect(homeForRole("Trabajador", true)).toBe("/pendiente");
    expect(vistaForRole(null)).toBe("pendiente");
  });
});

describe("guardRedirect", () => {
  it("deja pasar /sesion", () => {
    expect(guardRedirect("/sesion", "Trabajador")).toBeNull();
  });

  it("aísla OperadorSaaS en /plataforma", () => {
    expect(guardRedirect("/dashboard", "OperadorSaaS")).toBe("/plataforma");
    expect(guardRedirect("/plataforma/empresas", "OperadorSaaS")).toBeNull();
  });

  it("aísla Trabajador en /mi", () => {
    expect(guardRedirect("/dashboard", "Trabajador")).toBe("/mi");
    expect(guardRedirect("/plataforma", "Trabajador")).toBe("/mi");
    expect(guardRedirect("/mi/asistencia", "Trabajador")).toBeNull();
  });

  it("impide que RRHH entre a /plataforma o /mi", () => {
    expect(guardRedirect("/plataforma", "Admin de RRHH")).toBe("/dashboard");
    expect(guardRedirect("/mi", "Jefatura")).toBe("/dashboard");
    expect(guardRedirect("/dashboard", "Admin de RRHH")).toBeNull();
  });

  it("manda pendiente a /pendiente", () => {
    expect(guardRedirect("/dashboard", null, true)).toBe("/pendiente");
  });
});
