import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { adminAuthMiddleware } from "@/lib/middleware";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await adminAuthMiddleware(request);
  if (authError) {
    return NextResponse.json(
      { error: "인증이 필요합니다. 관리자로 로그인해주세요." },
      { status: 401 }
    );
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const fileName = searchParams.get("file");
    const documentId = searchParams.get("id");

    if (!fileName && !documentId) {
      return NextResponse.json(
        { error: "파일명 또는 문서 ID가 필요합니다." },
        { status: 400 }
      );
    }

    let filePath: string | null = null;

    // 문서 ID로 조회하는 경우
    if (documentId) {
      const { data: document, error: docError } = await supabaseAdmin
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        return NextResponse.json(
          { error: "문서를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // file_url에서 경로 추출 (전체 URL이면 경로만 추출)
      filePath = document.file_url;
      if (filePath && filePath.includes('supabase.co')) {
        // signed URL인 경우, 경로 추출이 복잡하므로 직접 사용
        // 또는 경로만 저장하도록 변경 필요
        const pathMatch = filePath.match(/\/storage\/v1\/object\/sign\/documents\/(.+)\?/);
        if (pathMatch) {
          filePath = pathMatch[1];
        }
      }
    } else {
      // 파일명으로 직접 접근 (기존 방식 호환)
      filePath = fileName;
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "파일 경로를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Supabase Storage에서 파일 다운로드
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError);
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Content-Type 설정
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
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

    const safeFileName = filePath.split('/').pop() || 'file';

    return new NextResponse(buffer, {
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
