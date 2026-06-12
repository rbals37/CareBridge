import { SignJWT, jwtVerify } from "jose";

export const TOKEN_COOKIE = "carebridge_token";
export const PATIENT_COOKIE = "carebridge_patient_id";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "carebridge-dev-secret-change-me",
);

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    userId: payload.userId as string,
    email: payload.email as string,
  };
}
