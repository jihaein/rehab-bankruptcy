import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const documentsFile = path.join(process.cwd(), "data", "documents.json");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");

    if (!existsSync(documentsFile)) {
      return NextResponse.json([]);
    }

    const data = await readFile(documentsFile, "utf-8");
    let documents = JSON.parse(data);

    // 필터링 (전화번호 또는 이름으로)
    if (phone) {
      documents = documents.filter((doc: any) => doc.phone === phone);
    }
    if (name) {
      documents = documents.filter((doc: any) => doc.name === name);
    }

    // 최신순으로 정렬
    documents.sort(
      (a: any, b: any) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error reading documents:", error);
    return NextResponse.json(
      { error: "서류를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
