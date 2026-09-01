import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("@aws-sdk/client-cognito-identity-provider", () => {
  class InitiateAuthCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  class ForgotPasswordCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  class ConfirmForgotPasswordCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  class RespondToAuthChallengeCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  return {
    CognitoIdentityProviderClient: class {
      send = sendMock;
    },
    InitiateAuthCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    RespondToAuthChallengeCommand,
    AuthFlowType: { USER_PASSWORD_AUTH: "USER_PASSWORD_AUTH" },
    ChallengeNameType: { NEW_PASSWORD_REQUIRED: "NEW_PASSWORD_REQUIRED" },
  };
});

describe("cognitoServer", () => {
  beforeEach(() => {
    sendMock.mockReset();
    process.env.COGNITO_CLIENT_ID = "client-id";
    process.env.COGNITO_CLIENT_SECRET = "client-secret";
    process.env.COGNITO_ISSUER =
      "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TEST";
    process.env.COGNITO_REGION = "us-east-1";
  });

  it("signInWithPassword devuelve tokens", async () => {
    sendMock.mockResolvedValueOnce({
      AuthenticationResult: {
        IdToken: "id.jwt",
        AccessToken: "access.jwt",
      },
    });

    const { signInWithPassword } = await import("./cognitoServer");
    const result = await signInWithPassword("user@test.cl", "Secret123");
    expect(result).toEqual({
      idToken: "id.jwt",
      accessToken: "access.jwt",
      refreshToken: undefined,
      email: "user@test.cl",
    });
  });

  it("signInWithPassword detecta NEW_PASSWORD_REQUIRED", async () => {
    sendMock.mockResolvedValueOnce({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: "session-xyz",
    });

    const { signInWithPassword } = await import("./cognitoServer");
    const result = await signInWithPassword("user@test.cl", "Temp1234");
    expect(result).toMatchObject({
      challenge: "NEW_PASSWORD_REQUIRED",
      session: "session-xyz",
      username: "user@test.cl",
    });
  });

  it("mapea NotAuthorizedException a mensaje amigable", async () => {
    sendMock.mockRejectedValue({
      name: "NotAuthorizedException",
      message: "Incorrect username or password.",
    });

    const { signInWithPassword, CognitoAuthError } = await import("./cognitoServer");
    await expect(signInWithPassword("user@test.cl", "bad")).rejects.toBeInstanceOf(
      CognitoAuthError
    );
    await expect(signInWithPassword("user@test.cl", "bad")).rejects.toMatchObject({
      message: "Correo o contraseña incorrectos.",
    });
  });

  it("forgotPassword ignora UserNotFoundException", async () => {
    sendMock.mockRejectedValueOnce({ name: "UserNotFoundException", message: "not found" });
    const { forgotPassword } = await import("./cognitoServer");
    await expect(forgotPassword("ghost@test.cl")).resolves.toBeUndefined();
  });
});
