import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_MAX_AGE = 60 * 60 * 24;

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "jisan-fallback";
}

export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "jisan-fixed-salt-2024")
    .digest("hex");
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

function signToken(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createSession(userId: string): string {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${sessionId}:${userId}:${expiresAt}`;
  const signature = signToken(payload);
  return `${payload}:${signature}`;
}

export function verifySession(sessionToken: string): { valid: boolean; userId?: string } {
  try {
    const parts = sessionToken.split(":");
    if (parts.length < 4) return { valid: false };

    const [sessionId, userId, expiresAt, signature] = parts;
    if (!sessionId || !userId || !expiresAt || !signature) return { valid: false };

    const payload = `${sessionId}:${userId}:${expiresAt}`;
    const expectedSignature = signToken(payload);
    if (signature !== expectedSignature) return { valid: false };

    if (Date.now() > parseInt(expiresAt)) return { valid: false };

    return { valid: true, userId };
  } catch {
    return { valid: false };
  }
}

export function createCustomerSession(customerId: string, phone: string): string {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${sessionId}:customer:${customerId}:${phone}:${expiresAt}`;
  const signature = signToken(payload);
  return `${payload}:${signature}`;
}

export function verifyCustomerSession(token: string): { valid: boolean; customerId?: string; phone?: string } {
  try {
    const parts = token.split(":");
    if (parts.length < 6) return { valid: false };

    const [sessionId, role, customerId, phone, expiresAt, signature] = parts;
    if (!sessionId || role !== "customer" || !customerId || !phone || !expiresAt || !signature) {
      return { valid: false };
    }

    const payload = `${sessionId}:customer:${customerId}:${phone}:${expiresAt}`;
    const expectedSignature = signToken(payload);
    if (signature !== expectedSignature) return { valid: false };

    if (Date.now() > parseInt(expiresAt)) return { valid: false };

    return { valid: true, customerId, phone };
  } catch {
    return { valid: false };
  }
}

export async function requireAdminAuth(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "인증이 필요합니다." };
    }
    const token = authHeader.substring(7);
    const session = verifySession(token);
    return session.valid
      ? { authorized: true }
      : { authorized: false, error: "유효하지 않은 세션입니다." };
  }

  const session = verifySession(sessionToken);
  return session.valid
    ? { authorized: true }
    : { authorized: false, error: "세션이 만료되었습니다." };
}

export async function requireCustomerAuth(request: NextRequest): Promise<{ authorized: boolean; phone?: string; customerId?: string; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_session")?.value;

  if (!token) {
    return { authorized: false, error: "고객 인증이 필요합니다." };
  }

  const session = verifyCustomerSession(token);
  if (!session.valid) {
    return { authorized: false, error: "세션이 만료되었습니다. 다시 로그인해주세요." };
  }

  return { authorized: true, phone: session.phone, customerId: session.customerId };
}

export async function adminLogin(password: string): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  if (hashPassword(password) !== hashPassword(adminPassword)) {
    return { success: false, error: "비밀번호가 올바르지 않습니다." };
  }
  const sessionToken = createSession("admin");
  return { success: true, sessionToken };
}
