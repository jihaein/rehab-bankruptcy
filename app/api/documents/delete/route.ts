import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const documentsFile = path.join(process.cwd(), "data", "documents.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");
    const phone = searchParams.get("phone");

    if (!documentId || !phone) {
      return NextResponse.json(
        { error: "문서 ID와 전화번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (!existsSync(documentsFile)) {
      return NextResponse.json(
        { error: "문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const data = await readFile(documentsFile, "utf-8");
    const documents = JSON.parse(data);

    const documentIndex = documents.findIndex(
      (doc: any) => doc.id === documentId && doc.phone === phone
    );

    if (documentIndex === -1) {
      return NextResponse.json(
        { error: "문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const document = documents[documentIndex];

    // 파일 삭제
    const filePath = path.join(uploadsDir, document.savedFileName);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error("Error deleting file:", error);
        // 파일 삭제 실패해도 문서는 삭제 진행
      }
    }

    // 문서에서 삭제
    documents.splice(documentIndex, 1);

    await writeFile(documentsFile, JSON.stringify(documents, null, 2));

    return NextResponse.json({
      success: true,
      message: "문서가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "문서 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
