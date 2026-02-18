import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "서버 설정 오류: Supabase 연결이 되지 않았습니다." },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");

    let query = supabaseAdmin
      .from('documents')
      .select('*');

    // 필터링 (전화번호 또는 이름으로)
    if (phone) {
      query = query.eq('phone', phone);
    }
    if (name) {
      query = query.eq('name', name);
    }

    // 최신순으로 정렬
    query = query.order('uploaded_at', { ascending: false });

    const { data: documents, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "서류 조회 실패: " + error.message },
        { status: 500 }
      );
    }

    // 기존 형식으로 변환 (프론트엔드 호환성)
    const formattedDocuments = (documents || []).map((doc: any) => {
      const rawUrl = doc.file_url || '';
      const fileUrl = rawUrl.startsWith('/api/') || rawUrl.startsWith('http')
        ? rawUrl
        : `/api/documents/file?file=${encodeURIComponent(rawUrl)}`;

      return {
        id: doc.id,
        name: doc.name,
        phone: doc.phone,
        documentType: doc.document_type,
        fileName: doc.file_name,
        savedFileName: rawUrl.split('/').pop() || '',
        fileUrl,
        uploadedAt: doc.uploaded_at,
        status: doc.status,
        privacyConsent: true,
        editHistory: doc.edit_history,
      };
    });

    // 캐시 방지 헤더 추가
    const response = NextResponse.json(formattedDocuments);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error("Error reading documents:", error);
    return NextResponse.json(
      { error: "서류를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
