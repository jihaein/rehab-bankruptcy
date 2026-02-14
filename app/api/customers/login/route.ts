import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { verifyPassword } from "@/lib/auth";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

const customersFile = path.join(process.cwd(), "data", "customers.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "전화번호와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!existsSync(customersFile)) {
      return NextResponse.json(
        { error: "등록된 고객 정보가 없습니다." },
        { status: 404 }
      );
    }

    const data = await readFile(customersFile, "utf-8");
    const customers = JSON.parse(data);

    // 비밀번호 검증 (해싱된 비밀번호와 비교)
    const customer = customers.find((c: any) => c.phone === phone);
    
    if (!customer) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    
    // 해싱된 비밀번호와 비교 (기존 평문 비밀번호도 호환성 위해 지원)
    const passwordMatch = customer.password && customer.password.length > 32 
      ? verifyPassword(password, customer.password) // 해싱된 비밀번호
      : customer.password === password || customer.passwordPlain === password; // 평문 비밀번호 (기존 호환성)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 비밀번호는 제외하고 반환
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      success: true,
      customer: customerWithoutPassword,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
