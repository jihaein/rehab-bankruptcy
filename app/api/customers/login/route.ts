import { NextRequest, NextResponse } from "next/server";
import { createCustomerSession, normalizePhone } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
    const { phone: rawPhone, password } = body;

    if (!rawPhone || !password) {
      return NextResponse.json(
        { error: "전화번호와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

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

    if (customer.password !== password) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const sessionToken = createCustomerSession(customer.id, customer.phone);

    const customerResponse = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      birthDate: customer.birth_date,
      requiredDocuments: customer.required_documents || [],
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    };

    const response = NextResponse.json({
      success: true,
      customer: customerResponse,
    });

    response.cookies.set("customer_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
