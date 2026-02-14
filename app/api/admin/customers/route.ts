import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomInt } from "crypto";
import { adminAuthMiddleware } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

const dataDir = path.join(process.cwd(), "data");
const customersFile = path.join(dataDir, "customers.json");

async function ensureDataDirectory() {
  try {
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    if (!existsSync(customersFile)) {
      await writeFile(customersFile, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Error ensuring data directory:", error);
    // Vercel에서는 파일 시스템이 제한적일 수 있으므로 에러를 무시하지 않음
    throw error;
  }
}

// 4자리 비밀번호 생성
function generatePassword(): string {
  return randomInt(1000, 10000).toString().padStart(4, "0");
}

export async function POST(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    await ensureDataDirectory();

    const body = await request.json();
    const { name, phone, birthDate, requiredDocuments } = body;

    if (!name || !phone || !requiredDocuments || requiredDocuments.length === 0) {
      return NextResponse.json(
        { error: "이름, 전화번호, 그리고 필요한 서류를 선택해주세요." },
        { status: 400 }
      );
    }

    // 기존 고객 목록 읽기
    const existingCustomers = existsSync(customersFile)
      ? JSON.parse(await readFile(customersFile, "utf-8"))
      : [];

    // 이미 등록된 전화번호인지 확인
    const existingCustomer = existingCustomers.find(
      (c: any) => c.phone === phone
    );

    const password = generatePassword();
    const hashedPassword = hashPassword(password); // 비밀번호 해싱
    
    const customer = {
      id: existingCustomer?.id || `customer_${Date.now()}`,
      name,
      phone,
      birthDate,
      requiredDocuments,
      password: hashedPassword, // 해싱된 비밀번호 저장
      passwordPlain: password, // 문자 발송용으로 평문도 임시 저장 (나중에 제거 권장)
      createdAt: existingCustomer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingCustomer) {
      // 기존 고객 업데이트
      const index = existingCustomers.findIndex((c: any) => c.phone === phone);
      existingCustomers[index] = customer;
    } else {
      // 새 고객 추가
      existingCustomers.push(customer);
    }

    await writeFile(customersFile, JSON.stringify(existingCustomers, null, 2));

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
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
    await ensureDataDirectory();

    if (!existsSync(customersFile)) {
      return NextResponse.json([]);
    }

    let data: string;
    try {
      data = await readFile(customersFile, "utf-8");
    } catch (readError) {
      console.error("Error reading customers file:", readError);
      // 파일 읽기 실패 시 빈 배열 반환
      return NextResponse.json([]);
    }

    // 빈 파일 처리
    if (!data || data.trim() === "") {
      return NextResponse.json([]);
    }

    let customers;
    try {
      customers = JSON.parse(data);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // 파일이 손상되었거나 비어있을 수 있음
      return NextResponse.json([]);
    }

    // 배열이 아닌 경우 빈 배열로 반환
    if (!Array.isArray(customers)) {
      console.error("Customers data is not an array:", customers);
      return NextResponse.json([]);
    }

    // 관리자용이므로 비밀번호 포함하여 반환
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error reading customers:", error);
    // 에러 발생 시 빈 배열 반환 (프론트엔드에서 filter 에러 방지)
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    await ensureDataDirectory();

    const body = await request.json();
    const { id, name, phone, birthDate, requiredDocuments, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: "고객 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!existsSync(customersFile)) {
      return NextResponse.json(
        { error: "등록된 고객이 없습니다." },
        { status: 404 }
      );
    }

    const data = await readFile(customersFile, "utf-8");
    const customers = JSON.parse(data);

    const customerIndex = customers.findIndex((c: any) => c.id === id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { error: "고객을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 고객 정보 가져오기
    const existingCustomer = customers[customerIndex];

    // 업데이트할 정보 구성
    const updatedCustomer = {
      ...existingCustomer,
      name: name || existingCustomer.name,
      phone: phone || existingCustomer.phone,
      birthDate: birthDate || existingCustomer.birthDate,
      requiredDocuments: requiredDocuments || existingCustomer.requiredDocuments,
      password: password ? hashPassword(password) : existingCustomer.password, // 비밀번호가 제공되면 해싱하여 업데이트
      updatedAt: new Date().toISOString(),
    };

    customers[customerIndex] = updatedCustomer;

    await writeFile(customersFile, JSON.stringify(customers, null, 2));

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
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
    await ensureDataDirectory();

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "고객 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!existsSync(customersFile)) {
      return NextResponse.json(
        { error: "등록된 고객이 없습니다." },
        { status: 404 }
      );
    }

    const data = await readFile(customersFile, "utf-8");
    const customers = JSON.parse(data);

    const customerIndex = customers.findIndex((c: any) => c.id === id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { error: "고객을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    customers.splice(customerIndex, 1);
    await writeFile(customersFile, JSON.stringify(customers, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "고객 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
