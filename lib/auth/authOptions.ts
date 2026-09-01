import type { NextAuthOptions, User } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import CredentialsProvider from "next-auth/providers/credentials";
import { CognitoAuthError, signInWithPassword } from "./cognitoServer";
import { decodeJwtClaims, resolveDisplayName } from "./displayName";

type CognitoPasswordUser = User & {
  idToken?: string;
  accessToken?: string;
};

const providers: NextAuthOptions["providers"] = [];

if (process.env.COGNITO_CLIENT_ID && process.env.COGNITO_ISSUER) {
  providers.push(
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.COGNITO_ISSUER,
      // Cognito + IdP federado (Google) siempre incluye nonce en el id_token.
      checks: ["nonce"],
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "cognito-password",
    name: "Email y contraseña",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      idToken: { label: "idToken", type: "text" },
      accessToken: { label: "accessToken", type: "text" },
    },
    async authorize(credentials): Promise<CognitoPasswordUser | null> {
      // Flujo post-challenge / API: tokens ya emitidos por Cognito
      if (credentials?.idToken) {
        const claims = decodeJwtClaims(credentials.idToken);
        if (!claims) {
          throw new Error("Token Cognito inválido");
        }
        const sub = typeof claims.sub === "string" ? claims.sub : null;
        const email =
          (typeof claims.email === "string" && claims.email) ||
          credentials.email ||
          null;
        if (!sub) {
          throw new Error("Token Cognito sin subject");
        }
        return {
          id: sub,
          email: email ?? undefined,
          name: resolveDisplayName(claims, email),
          idToken: credentials.idToken,
          accessToken: credentials.accessToken || credentials.idToken,
        };
      }

      if (!credentials?.email || !credentials?.password) {
        throw new Error("Correo y contraseña son obligatorios");
      }

      try {
        const result = await signInWithPassword(credentials.email, credentials.password);
        if ("challenge" in result) {
          // NextAuth no puede devolver el challenge; el cliente usa la API dedicada.
          throw new Error(
            `NEW_PASSWORD_REQUIRED:${JSON.stringify({
              session: result.session,
              username: result.username,
              email: result.email,
            })}`
          );
        }

        const claims = decodeJwtClaims(result.idToken);
        const sub =
          (typeof claims?.sub === "string" && claims.sub) ||
          result.sub ||
          credentials.email;
        const email =
          (typeof claims?.email === "string" && claims.email) ||
          result.email ||
          credentials.email;

        return {
          id: sub,
          email,
          name: resolveDisplayName(claims, email),
          idToken: result.idToken,
          accessToken: result.accessToken,
        };
      } catch (err) {
        if (err instanceof CognitoAuthError) {
          throw new Error(err.message);
        }
        throw err;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "cognito-password") {
        const credUser = user as CognitoPasswordUser | undefined;
        if (credUser?.idToken) {
          token.accessToken = credUser.idToken;
          token.idToken = credUser.idToken;
        }
      } else if (account?.provider === "cognito") {
        // Cognito OAuth (Google): el access_token casi nunca trae email/name; el id_token sí.
        token.accessToken = account.id_token ?? account.access_token;
        if (account.id_token) {
          token.idToken = account.id_token;
        }
      } else {
        if (account?.access_token) {
          token.accessToken = account.access_token;
        }
        if (account?.id_token) {
          token.idToken = account.id_token;
        }
      }

      const profileClaims = (profile ?? {}) as Record<string, unknown>;
      const idClaims = decodeJwtClaims(account?.id_token ?? (token.idToken as string | undefined));
      const accessClaims = decodeJwtClaims(
        account?.access_token ?? (token.accessToken as string | undefined)
      );

      const email =
        (typeof profileClaims.email === "string" && profileClaims.email) ||
        (typeof idClaims?.email === "string" && idClaims.email) ||
        (typeof accessClaims?.email === "string" && accessClaims.email) ||
        (typeof user?.email === "string" && user.email) ||
        (typeof token.email === "string" ? token.email : undefined);

      if (email) {
        token.email = email;
      }

      const displayName =
        resolveDisplayName(profileClaims, email) ||
        resolveDisplayName(idClaims, email) ||
        resolveDisplayName(accessClaims, email) ||
        (typeof user?.name === "string" ? user.name.trim() : undefined) ||
        (typeof token.name === "string" ? token.name.trim() : undefined);

      if (displayName) {
        token.name = displayName;
      }

      if (profileClaims["custom:role"]) {
        token.role = String(profileClaims["custom:role"]);
      } else if (idClaims?.["custom:role"]) {
        token.role = String(idClaims["custom:role"]);
      }

      if (profileClaims["custom:tenant_id"]) {
        token.tenantId = String(profileClaims["custom:tenant_id"]);
      } else if (idClaims?.["custom:tenant_id"]) {
        token.tenantId = String(idClaims["custom:tenant_id"]);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.role = token.role as string | undefined;
      session.tenantId = token.tenantId as string | undefined;
      if (session.user) {
        if (token.email) {
          session.user.email = token.email as string;
        }
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "local-dev-secret-change-me",
};
