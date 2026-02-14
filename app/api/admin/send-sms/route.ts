import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, password, requiredDocuments, siteUrl } = body;

    if (!phone || !name || !password || !requiredDocuments) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 실제 SMS API 연동은 여기에 구현
    // 현재는 시뮬레이션으로 메시지 내용만 반환
    const documentList = requiredDocuments.join(", ");
    const loginUrl = `${siteUrl || "http://localhost:3000"}/documents`;

    const message = `[회생파산 상담 서류 제출 안내]

${name}님 안녕하세요.

상담 진행을 위해 아래 서류를 제출해주시기 바랍니다.

필요한 서류: ${documentList}

서류 제출 방법:
1. 아래 링크를 클릭하여 접속하세요
${loginUrl}

2. 로그인 정보:
   아이디: ${phone}
   비밀번호: ${password}

3. 필요한 서류를 확인하고 업로드해주세요.

문의사항이 있으시면 연락주시기 바랍니다.`;

    // 실제 SMS 발송 API 호출 (예시)
    // const smsResponse = await fetch('YOUR_SMS_API_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone, message })
    // });

    // 현재는 시뮬레이션
    console.log("=== SMS 발송 시뮬레이션 ===");
    console.log(`수신번호: ${phone}`);
    console.log(`메시지:\n${message}`);
    console.log("========================");

    return NextResponse.json({
      success: true,
      message: "문자 메시지가 발송되었습니다.",
      simulatedMessage: message, // 개발용으로 메시지 내용 반환
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { error: "문자 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
