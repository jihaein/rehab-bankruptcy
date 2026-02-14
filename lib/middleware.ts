import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "./auth";

// 관리자 API 인증 미들웨어
export async function adminAuthMiddleware(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "인증이 필요합니다." },
      { status: 401 }
    );
  }
  
  return null; // 인증 통과
}

// 파일 업로드 검증
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // 파일 크기 제한 (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "파일 크기는 10MB를 초과할 수 없습니다." };
  }

  // 허용된 파일 타입
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "허용되지 않은 파일 형식입니다. (JPG, PNG, PDF만 가능)" };
  }

  // 파일 이름 검증 (경로 탐색 공격 방지)
  const fileName = file.name;
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return { valid: false, error: "유효하지 않은 파일 이름입니다." };
  }

  return { valid: true };
}
