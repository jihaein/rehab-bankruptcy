import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { adminAuthMiddleware } from "@/lib/middleware";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

const dataDir = path.join(process.cwd(), "data");
const submissionsFile = path.join(dataDir, "submissions.json");

export async function GET(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  try {
    if (!fs.existsSync(submissionsFile)) {
      return NextResponse.json([]);
    }

    const data = fs.readFileSync(submissionsFile, "utf-8");
    const submissions = JSON.parse(data);

    // 최신순으로 정렬
    submissions.sort(
      (a: any, b: any) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error reading submissions:", error);
    return NextResponse.json(
      { error: "데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    const { searchParams } = request.nextUrl;
    const index = searchParams.get("index");

    if (index === null) {
      return NextResponse.json(
        { error: "삭제할 항목의 인덱스가 필요합니다." },
        { status: 400 }
      );
    }

    if (!fs.existsSync(submissionsFile)) {
      return NextResponse.json(
        { error: "제출 내역이 없습니다." },
        { status: 404 }
      );
    }

    const data = fs.readFileSync(submissionsFile, "utf-8");
    const submissions = JSON.parse(data);

    const itemIndex = parseInt(index, 10);
    if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= submissions.length) {
      return NextResponse.json(
        { error: "유효하지 않은 인덱스입니다." },
        { status: 400 }
      );
    }

    submissions.splice(itemIndex, 1);
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
