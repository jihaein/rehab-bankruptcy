import { NextRequest, NextResponse } from "next/server";
import { adminLogin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const result = await adminLogin(password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // HTTP-only 쿠키에 세션 저장
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", result.sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24시간
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during admin login:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // 로그아웃
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
