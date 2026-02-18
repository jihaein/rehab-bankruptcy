import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "전화번호와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // Supabase에서 고객 정보 조회
    const { data: customers, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .limit(1);

    if (fetchError) {
      console.error("Error fetching customer:", fetchError);
      return NextResponse.json(
        { error: "로그인 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const customer = customers[0];
    
    // 해싱된 비밀번호와 비교 (기존 평문 비밀번호도 호환성 위해 지원)
    const passwordMatch = customer.password && customer.password.length > 32 
      ? verifyPassword(password, customer.password) // 해싱된 비밀번호
      : customer.password === password || customer.password_plain === password; // 평문 비밀번호 (기존 호환성)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 기존 형식으로 변환 (프론트엔드 호환성)
    const customerResponse = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      birthDate: customer.birth_date,
      requiredDocuments: customer.required_documents || [],
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    };

    return NextResponse.json({
      success: true,
      customer: customerResponse,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
