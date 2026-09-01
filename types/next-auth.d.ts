import "next-auth";

declare module "next-auth" {
  interface Session {
    /** Bearer para APIs: id_token de Cognito (claims email/name). */
    accessToken?: string;
    role?: string;
    tenantId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Token enviado al gateway/MS como Authorization Bearer. */
    accessToken?: string;
    idToken?: string;
    role?: string;
    tenantId?: string;
  }
}
