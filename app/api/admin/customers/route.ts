import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { adminAuthMiddleware } from "@/lib/middleware";
import { normalizePhone } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

// 6자리 숫자 비밀번호 생성
function generatePassword(): string {
  return randomInt(100000, 1000000).toString();
}

// UUID 생성 (간단 버전)
function generateId(): string {
  return `customer_${Date.now()}_${randomInt(1000, 9999)}`;
}

export async function POST(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, phone: rawPhone, birthDate, requiredDocuments } = body;

    if (!name || !rawPhone || !requiredDocuments || requiredDocuments.length === 0) {
      return NextResponse.json(
        { error: "이름, 전화번호, 그리고 필요한 서류를 선택해주세요." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    // 기존 고객 확인
    const { data: existingCustomers, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .limit(1);

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing customer:", fetchError);
      return NextResponse.json(
        { error: "고객 정보 확인 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const existingCustomer = existingCustomers && existingCustomers.length > 0 
      ? existingCustomers[0] 
      : null;

    const password = generatePassword();
    
    const customerData = {
      id: existingCustomer?.id || generateId(),
      name,
      phone,
      birth_date: birthDate || null,
      required_documents: requiredDocuments,
      password,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existingCustomer) {
      // 기존 고객 업데이트
      const { data, error } = await supabaseAdmin
        .from('customers')
        .update(customerData)
        .eq('id', existingCustomer.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json(
          { error: "고객 정보 업데이트 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // 새 고객 추가
      const newCustomer = {
        ...customerData,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
          { error: "고객 정보 저장 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      customer: {
        ...result,
        password, // 비밀번호는 응답에 포함 (문자 발송용)
      },
    });
  } catch (error) {
    console.error("Error saving customer:", error);
    return NextResponse.json(
      { error: "고객 정보 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available");
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json([], { status: 200 });
    }

    // Supabase에서 가져온 데이터를 기존 형식으로 변환 (필요시)
    const customers = (data || []).map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      birthDate: customer.birth_date,
      requiredDocuments: customer.required_documents || [],
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    }));

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Unexpected error reading customers:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, name, phone: rawPhone, birthDate, requiredDocuments, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: "고객 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 기존 고객 확인
    const { data: existingCustomer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { error: "고객을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 업데이트할 정보 구성
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (rawPhone) updateData.phone = normalizePhone(rawPhone);
    if (birthDate !== undefined) updateData.birth_date = birthDate;
    if (requiredDocuments) updateData.required_documents = requiredDocuments;
    if (password) updateData.password = password;

    const { data: updatedCustomer, error: updateError } = await supabaseAdmin
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating customer:", updateError);
      return NextResponse.json(
        { error: "고객 정보 업데이트 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 기존 형식으로 변환
    const customer = {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      phone: updatedCustomer.phone,
      birthDate: updatedCustomer.birth_date,
      requiredDocuments: updatedCustomer.required_documents || [],
      createdAt: updatedCustomer.created_at,
      updatedAt: updatedCustomer.updated_at,
    };

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "고객 정보 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "고객 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting customer:", error);
      return NextResponse.json(
        { error: "고객 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "고객 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
