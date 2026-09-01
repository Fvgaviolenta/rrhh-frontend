import { NextResponse } from "next/server";
import {
  CognitoAuthError,
  respondNewPassword,
} from "@/lib/auth/cognitoServer";
import { z } from "zod";

const bodySchema = z.object({
  username: z.string().min(1),
  session: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const tokens = await respondNewPassword(
      parsed.data.username,
      parsed.data.session,
      parsed.data.newPassword
    );

    return NextResponse.json({
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      email: tokens.email ?? parsed.data.username,
    });
  } catch (err) {
    const message =
      err instanceof CognitoAuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
