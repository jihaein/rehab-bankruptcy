import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminAuth, requireCustomerAuth, normalizePhone } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  const adminAuth = await requireAdminAuth(request);
  const customerAuth = await requireCustomerAuth(request);

  if (!adminAuth.authorized && !customerAuth.authorized) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available");
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const documentId = searchParams.get("id");
    const rawPhone = searchParams.get("phone");
    const phone = rawPhone ? normalizePhone(rawPhone) : null;

    if (!documentId || !phone) {
      return NextResponse.json(
        { error: "문서 ID와 전화번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (customerAuth.authorized && customerAuth.phone !== phone) {
      return NextResponse.json(
        { error: "본인의 서류만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 문서 정보 가져오기 (파일 경로 확인용)
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('file_url, id, phone')
      .eq('id', documentId)
      .eq('phone', phone)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching document:", fetchError);
      return NextResponse.json(
        { error: `문서 조회 중 오류가 발생했습니다: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: "문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Supabase Storage에서 파일 삭제
    // file_url에서 경로 추출
    let filePath: string | null = null;
    
    if (document.file_url) {
      // signed URL인 경우 경로 추출
      if (document.file_url.includes('supabase.co')) {
        const pathMatch = document.file_url.match(/\/storage\/v1\/object\/sign\/documents\/(.+)\?/);
        if (pathMatch) {
          filePath = pathMatch[1];
        }
      } else if (document.file_url.startsWith('/api/documents/file')) {
        // 기존 로컬 파일인 경우 (마이그레이션 전 데이터)
        // 로컬 파일은 삭제하지 않고 메타데이터만 삭제
        filePath = null; // Storage에서 삭제하지 않음
      } else {
        // 이미 경로인 경우
        filePath = document.file_url;
      }

      // Storage에서 파일 삭제 (Supabase Storage에 있는 경우만)
      if (filePath && !document.file_url.startsWith('/api/')) {
        const { error: storageError } = await supabaseAdmin.storage
          .from('documents')
          .remove([filePath]);

        if (storageError) {
          console.error("Storage delete error:", storageError);
          // 파일 삭제 실패해도 문서는 삭제 진행
        }
      }
    }

    // 데이터베이스에서 문서 삭제
    const { error: deleteError, data: deleteData } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('phone', phone)
      .select();

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json(
        { error: `문서 삭제 중 오류가 발생했습니다: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // 삭제된 행이 없으면
    if (!deleteData || deleteData.length === 0) {
      return NextResponse.json(
        { error: "삭제할 문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

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
