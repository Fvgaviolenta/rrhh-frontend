import { NextResponse } from "next/server";
import {
  CognitoAuthError,
  confirmForgotPassword,
} from "@/lib/auth/cognitoServer";
import { resetPasswordSchema } from "@/lib/schemas/loginSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    await confirmForgotPassword(
      parsed.data.email,
      parsed.data.code,
      parsed.data.newPassword
    );

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    });
  } catch (err) {
    const message =
      err instanceof CognitoAuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "No se pudo restablecer la contraseña";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
