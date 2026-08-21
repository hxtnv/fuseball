import { SignJWT, jwtVerify } from "jose";

// Shared JWT config. The SECRET is read from env so the central server (which
// SIGNS tokens) and the game server (which only VERIFIES them) agree. Auth logic
// — account creation, sign-in — lives ONLY in the central server; the game server
// imports verifyToken and nothing else.
const secretString =
  process.env.JWT_SECRET ?? "dev-insecure-secret-change-me-in-prod";
const secret = new TextEncoder().encode(secretString);
const ISSUER = "fuseball";
const ALG = "HS256";
const EXPIRY = "30d";

export interface TokenPayload {
  userId: string;
  name: string;
}

export const signToken = (payload: TokenPayload): Promise<string> =>
  new SignJWT({ name: payload.name })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret);

export const verifyToken = async (
  token: string,
): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER });
    if (typeof payload.sub !== "string" || typeof payload.name !== "string")
      return null;
    return { userId: payload.sub, name: payload.name };
  } catch {
    return null;
  }
};

// Pull a Bearer token out of an Authorization header value.
export const bearer = (header: string | null): string | null => {
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m ? m[1]! : null;
};
