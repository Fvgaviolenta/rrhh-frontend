import { NextResponse } from "next/server";
import { CognitoAuthError, forgotPassword } from "@/lib/auth/cognitoServer";
import { forgotPasswordSchema } from "@/lib/schemas/loginSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    await forgotPassword(parsed.data.email);
    // Respuesta genérica: no revelar si el email existe
    return NextResponse.json({
      ok: true,
      message:
        "Si el correo está registrado, recibirás un código para restablecer tu contraseña.",
    });
  } catch (err) {
    const message =
      err instanceof CognitoAuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "No se pudo solicitar el restablecimiento";
    const status = err instanceof CognitoAuthError && err.code === "CONFIG" ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
