import { NextResponse } from "next/server";
import {
  CognitoAuthError,
  signInWithPassword,
} from "@/lib/auth/cognitoServer";
import { loginSchema } from "@/lib/schemas/loginSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const result = await signInWithPassword(parsed.data.email, parsed.data.password);

    if ("challenge" in result) {
      return NextResponse.json({
        challenge: result.challenge,
        session: result.session,
        username: result.username,
        email: result.email,
      });
    }

    return NextResponse.json({
      idToken: result.idToken,
      accessToken: result.accessToken,
      email: result.email ?? parsed.data.email,
    });
  } catch (err) {
    const message =
      err instanceof CognitoAuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión";
    const status = err instanceof CognitoAuthError && err.code === "CONFIG" ? 503 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
