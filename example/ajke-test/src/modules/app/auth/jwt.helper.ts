import { SignJWT, jwtVerify } from "jose";

export interface JwtPayload {
  user?: {
    id: string;
    roles?: string[];
    deliverymanId?: string;
    email?: string;
    phoneNumber?: string;
  };
  permissions?: string[];
  isRefreshToken?: boolean;
}

function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JwtPayload, secret: string, expiresIn: string): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey(secret));
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(secret));
  return payload as unknown as JwtPayload;
}

export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  return authorization.replace(/^Bearer\s+/i, "").trim() || null;
}

export async function generateOtpHash(identifier: string, otp: number, secret: string): Promise<string> {
  const data = `${identifier}:${otp}:${secret}`;
  const buf = new TextEncoder().encode(data);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuf)));
}

export async function verifyOtpHash(identifier: string, otp: number, hash: string, secret: string): Promise<boolean> {
  const expected = await generateOtpHash(identifier, otp, secret);
  return expected === hash;
}

export function generateOTP(): number {
  return Math.floor(100000 + Math.random() * 900000);
}
