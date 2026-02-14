import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// 세션 관리
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_MAX_AGE = 60 * 60 * 24; // 24시간

// 비밀번호 해싱 (bcrypt 대신 간단한 해싱, 프로덕션에서는 bcrypt 사용 권장)
export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + SESSION_SECRET)
    .digest("hex");
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}

// 세션 생성
export function createSession(userId: string): string {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  
  // 실제로는 Redis나 데이터베이스에 저장해야 함
  // 여기서는 간단한 예시
  return `${sessionId}:${userId}:${expiresAt}`;
}

// 세션 검증
export function verifySession(sessionToken: string): { valid: boolean; userId?: string } {
  try {
    const [sessionId, userId, expiresAt] = sessionToken.split(":");
    if (!sessionId || !userId || !expiresAt) {
      return { valid: false };
    }
    
    if (Date.now() > parseInt(expiresAt)) {
      return { valid: false };
    }
    
    return { valid: true, userId };
  } catch {
    return { valid: false };
  }
}

// 관리자 인증 미들웨어
export async function requireAdminAuth(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  // 쿠키에서 세션 토큰 가져오기
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  
  if (!sessionToken) {
    // Authorization 헤더에서도 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "인증이 필요합니다." };
    }
    
    const token = authHeader.substring(7);
    const session = verifySession(token);
    if (!session.valid) {
      return { authorized: false, error: "유효하지 않은 세션입니다." };
    }
    
    return { authorized: true };
  }
  
  const session = verifySession(sessionToken);
  if (!session.valid) {
    return { authorized: false, error: "세션이 만료되었습니다." };
  }
  
  return { authorized: true };
}

// 관리자 로그인
export async function adminLogin(password: string): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  const hashedAdminPassword = hashPassword(adminPassword);
  const inputHash = hashPassword(password);
  
  if (inputHash !== hashedAdminPassword) {
    return { success: false, error: "비밀번호가 올바르지 않습니다." };
  }
  
  const sessionToken = createSession("admin");
  return { success: true, sessionToken };
}
