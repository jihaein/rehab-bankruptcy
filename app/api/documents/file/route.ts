import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        { error: "파일명이 필요합니다." },
        { status: 400 }
      );
    }

    // 보안: 파일명에 경로 조작 방지
    const safeFileName = path.basename(fileName);
    const filePath = path.join(uploadsDir, safeFileName);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(safeFileName).toLowerCase();

    // Content-Type 설정
    let contentType = "application/octet-stream";
    if (ext === ".pdf") {
      contentType = "application/pdf";
    } else if ([".jpg", ".jpeg"].includes(ext)) {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeFileName}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "파일을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
