import { describe, expect, it } from "vitest";
import { canManageUsers, decodeJwtPayload } from "@/lib/utils/roles";

describe("roles utils", () => {
  it("identifica admin de RRHH", () => {
    expect(canManageUsers("Admin de RRHH")).toBe(true);
    expect(canManageUsers("Trabajador")).toBe(false);
  });

  it("decodifica payload jwt base64", () => {
    const payload = btoa(JSON.stringify({ role: "Trabajador" }));
    const token = `header.${payload}.sig`;
    expect(decodeJwtPayload(token)).toEqual({ role: "Trabajador" });
  });
});
