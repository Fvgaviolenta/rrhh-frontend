import { z } from "zod";

export const empresaIngresoSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre de tu empresa"),
});

export type EmpresaIngresoValues = z.infer<typeof empresaIngresoSchema>;
