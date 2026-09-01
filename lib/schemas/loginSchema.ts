import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const passwordPolicy = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[a-z]/, "Debe incluir al menos una minúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número");

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo válido"),
    code: z.string().trim().min(1, "El código es obligatorio"),
    newPassword: passwordPolicy,
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: passwordPolicy,
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
