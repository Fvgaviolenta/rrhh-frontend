import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  newPasswordSchema,
  resetPasswordSchema,
} from "./loginSchema";

describe("loginSchema", () => {
  it("acepta email y password válidos", () => {
    const result = loginSchema.safeParse({
      email: "user@empresa.cl",
      password: "Secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = loginSchema.safeParse({
      email: "no-es-email",
      password: "Secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza password vacío", () => {
    const result = loginSchema.safeParse({
      email: "user@empresa.cl",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("acepta email válido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.cl" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("exige coincidencia de contraseñas", () => {
    const result = resetPasswordSchema.safeParse({
      email: "a@b.cl",
      code: "123456",
      newPassword: "Secret123",
      confirmPassword: "Otra1234",
    });
    expect(result.success).toBe(false);
  });

  it("acepta payload completo válido", () => {
    const result = resetPasswordSchema.safeParse({
      email: "a@b.cl",
      code: "123456",
      newPassword: "Secret123",
      confirmPassword: "Secret123",
    });
    expect(result.success).toBe(true);
  });
});

describe("newPasswordSchema", () => {
  it("exige mayúscula, minúscula y número", () => {
    expect(
      newPasswordSchema.safeParse({
        newPassword: "short",
        confirmPassword: "short",
      }).success
    ).toBe(false);
  });
});
