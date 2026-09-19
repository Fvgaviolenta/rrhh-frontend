import { describe, expect, it } from "vitest";
import { empresaIngresoSchema } from "./empresaSchema";

describe("empresaIngresoSchema", () => {
  it("acepta nombre de empresa", () => {
    expect(empresaIngresoSchema.safeParse({ nombre: "Empresa Demo SpA" }).success).toBe(true);
  });

  it("rechaza vacío", () => {
    expect(empresaIngresoSchema.safeParse({ nombre: " " }).success).toBe(false);
  });
});
