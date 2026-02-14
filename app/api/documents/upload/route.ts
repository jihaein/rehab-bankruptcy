import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { validateFileUpload } from "@/lib/middleware";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const documentsFile = path.join(process.cwd(), "data", "documents.json");

// 디렉토리 생성
async function ensureDirectories() {
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
  if (!existsSync(documentsFile)) {
    await writeFile(documentsFile, JSON.stringify([], null, 2));
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const privacyConsent = formData.get("privacyConsent") as string;
    const status = (formData.get("status") as string) || "draft";
    const documentTypes = formData.getAll("documentTypes") as string[];

    if (!name || !phone) {
      return NextResponse.json(
        { error: "이름, 연락처는 필수입니다." },
        { status: 400 }
      );
    }

    if (privacyConsent !== "true") {
      return NextResponse.json(
        { error: "개인정보 수집 및 이용에 동의해주세요." },
        { status: 400 }
      );
    }

    if (!documentTypes || documentTypes.length === 0) {
      return NextResponse.json(
        { error: "최소 하나 이상의 서류를 업로드해주세요." },
        { status: 400 }
      );
    }

    // 기존 문서 목록 읽기
    const existingDocuments = existsSync(documentsFile)
      ? JSON.parse(await readFile(documentsFile, "utf-8"))
      : [];

    const uploadedDocuments: any[] = [];

    // 각 서류 유형별로 파일 처리
    for (const documentType of documentTypes) {
      const files = formData.getAll(`files_${documentType}`) as File[];

      if (!files || files.length === 0) {
        continue;
      }

      // 기존에 같은 서류 유형의 문서가 있는지 확인
      const existingDocIndex = existingDocuments.findIndex(
        (doc: any) => doc.phone === phone && doc.documentType === documentType
      );

      let editHistory: any[] = [];
      if (existingDocIndex !== -1) {
        const existingDoc = existingDocuments[existingDocIndex];
        // 기존 문서의 수정 이력 가져오기
        editHistory = existingDoc.editHistory || [];
        
        // 수정 로그 추가
        editHistory.push({
          action: "수정",
          previousFileName: existingDoc.fileName,
          previousSavedFileName: existingDoc.savedFileName,
          modifiedAt: new Date().toISOString(),
        });

        // 기존 문서 삭제 (파일은 나중에 정리)
        existingDocuments.splice(existingDocIndex, 1);
      }

      // 각 파일 저장
      for (const file of files) {
        // 파일 검증
        const validation = validateFileUpload(file);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 파일 확장자 추출
        const originalName = file.name;
        const ext = path.extname(originalName);
        const fileName = `${randomUUID()}${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        // 파일 저장
        await writeFile(filePath, buffer);

        const document = {
          id: randomUUID(),
          name,
          phone,
          documentType,
          fileName: originalName,
          savedFileName: fileName,
          fileUrl: `/api/documents/file?file=${fileName}`,
          uploadedAt: new Date().toISOString(),
          status: status as "draft" | "submitted",
          privacyConsent: true,
          editHistory: editHistory.length > 0 ? editHistory : undefined,
        };

        uploadedDocuments.push(document);
        existingDocuments.push(document);
      }
    }

    // 문서 목록 저장
    await writeFile(documentsFile, JSON.stringify(existingDocuments, null, 2));

    return NextResponse.json({
      success: true,
      documents: uploadedDocuments,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "서류 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
