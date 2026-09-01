import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  AuthFlowType,
  ChallengeNameType,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";

export class CognitoAuthError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CognitoAuthError";
  }
}

export type CognitoTokens = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  email?: string;
  sub?: string;
};

export type NewPasswordChallenge = {
  challenge: "NEW_PASSWORD_REQUIRED";
  session: string;
  username: string;
  email: string;
};

export type SignInResult = CognitoTokens | NewPasswordChallenge;

function requireConfig() {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const issuer = process.env.COGNITO_ISSUER;
  if (!clientId || !issuer) {
    throw new CognitoAuthError(
      "Cognito no está configurado. Revisa COGNITO_CLIENT_ID y COGNITO_ISSUER.",
      "CONFIG"
    );
  }
  return { clientId, clientSecret: clientSecret ?? "", issuer };
}

function regionFromIssuer(issuer: string): string {
  const fromEnv = process.env.COGNITO_REGION;
  if (fromEnv) return fromEnv;
  // https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXX
  const match = issuer.match(/cognito-idp\.([a-z0-9-]+)\.amazonaws\.com/);
  return match?.[1] ?? "us-east-1";
}

function getClient() {
  const { issuer } = requireConfig();
  return new CognitoIdentityProviderClient({ region: regionFromIssuer(issuer) });
}

export function computeSecretHash(username: string): string | undefined {
  const { clientId, clientSecret } = requireConfig();
  if (!clientSecret) return undefined;
  return createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

function mapAwsError(err: unknown): never {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "UnknownError";
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : "Error de autenticación con Cognito";

  switch (name) {
    case "NotAuthorizedException":
      throw new CognitoAuthError("Correo o contraseña incorrectos.", name);
    case "UserNotFoundException":
      throw new CognitoAuthError("Correo o contraseña incorrectos.", name);
    case "UserNotConfirmedException":
      throw new CognitoAuthError(
        "Tu cuenta aún no está confirmada. Revisa tu correo.",
        name
      );
    case "PasswordResetRequiredException":
      throw new CognitoAuthError(
        "Debes restablecer tu contraseña antes de ingresar.",
        name
      );
    case "InvalidPasswordException":
      throw new CognitoAuthError(
        "La contraseña no cumple la política de seguridad.",
        name
      );
    case "CodeMismatchException":
      throw new CognitoAuthError("El código de verificación es incorrecto.", name);
    case "ExpiredCodeException":
      throw new CognitoAuthError("El código de verificación expiró. Solicita uno nuevo.", name);
    case "LimitExceededException":
    case "TooManyRequestsException":
      throw new CognitoAuthError("Demasiados intentos. Espera un momento e inténtalo de nuevo.", name);
    case "InvalidParameterException":
      throw new CognitoAuthError(message || "Parámetros inválidos.", name);
    default:
      throw new CognitoAuthError(message || "No se pudo completar la autenticación.", name);
  }
}

function tokensFromAuthResult(
  authResult: {
    IdToken?: string;
    AccessToken?: string;
    RefreshToken?: string;
  },
  emailHint?: string
): CognitoTokens {
  if (!authResult.IdToken || !authResult.AccessToken) {
    throw new CognitoAuthError("Cognito no devolvió tokens válidos.", "NO_TOKENS");
  }
  return {
    idToken: authResult.IdToken,
    accessToken: authResult.AccessToken,
    refreshToken: authResult.RefreshToken,
    email: emailHint,
  };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<SignInResult> {
  const { clientId } = requireConfig();
  const username = email.trim().toLowerCase();
  const secretHash = computeSecretHash(username);

  try {
    const response = await getClient().send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          ...(secretHash ? { SECRET_HASH: secretHash } : {}),
        },
      })
    );

    if (response.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
      if (!response.Session) {
        throw new CognitoAuthError(
          "Cognito pidió nueva contraseña pero no envió sesión.",
          "NEW_PASSWORD_REQUIRED"
        );
      }
      return {
        challenge: "NEW_PASSWORD_REQUIRED",
        session: response.Session,
        username,
        email: username,
      };
    }

    if (!response.AuthenticationResult) {
      throw new CognitoAuthError(
        "Respuesta de Cognito incompleta. Revisa el App client (ALLOW_USER_PASSWORD_AUTH).",
        "INCOMPLETE"
      );
    }

    return tokensFromAuthResult(response.AuthenticationResult, username);
  } catch (err) {
    if (err instanceof CognitoAuthError) throw err;
    mapAwsError(err);
  }
}

export async function respondNewPassword(
  username: string,
  session: string,
  newPassword: string
): Promise<CognitoTokens> {
  const { clientId } = requireConfig();
  const normalized = username.trim().toLowerCase();
  const secretHash = computeSecretHash(normalized);

  try {
    const response = await getClient().send(
      new RespondToAuthChallengeCommand({
        ClientId: clientId,
        ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
        Session: session,
        ChallengeResponses: {
          USERNAME: normalized,
          NEW_PASSWORD: newPassword,
          ...(secretHash ? { SECRET_HASH: secretHash } : {}),
        },
      })
    );

    if (!response.AuthenticationResult) {
      throw new CognitoAuthError(
        "No se pudo completar el cambio de contraseña temporal.",
        "INCOMPLETE"
      );
    }

    return tokensFromAuthResult(response.AuthenticationResult, normalized);
  } catch (err) {
    if (err instanceof CognitoAuthError) throw err;
    mapAwsError(err);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const { clientId } = requireConfig();
  const username = email.trim().toLowerCase();
  const secretHash = computeSecretHash(username);

  try {
    await getClient().send(
      new ForgotPasswordCommand({
        ClientId: clientId,
        Username: username,
        ...(secretHash ? { SecretHash: secretHash } : {}),
      })
    );
  } catch (err) {
    // No revelar si el email existe: UserNotFound se trata como éxito silencioso
    const name =
      err && typeof err === "object" && "name" in err
        ? String((err as { name: string }).name)
        : "";
    if (name === "UserNotFoundException") {
      return;
    }
    if (err instanceof CognitoAuthError) throw err;
    mapAwsError(err);
  }
}

export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const { clientId } = requireConfig();
  const username = email.trim().toLowerCase();
  const secretHash = computeSecretHash(username);

  try {
    await getClient().send(
      new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: username,
        ConfirmationCode: code.trim(),
        Password: newPassword,
        ...(secretHash ? { SecretHash: secretHash } : {}),
      })
    );
  } catch (err) {
    if (err instanceof CognitoAuthError) throw err;
    mapAwsError(err);
  }
}
