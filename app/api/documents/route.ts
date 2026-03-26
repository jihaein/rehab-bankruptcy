import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminAuth, requireCustomerAuth, normalizePhone } from "@/lib/auth";

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
    const rawPhone = searchParams.get("phone");
    const phone = rawPhone ? normalizePhone(rawPhone) : null;
    const name = searchParams.get("name");

    if (phone) {
      const customerAuth = await requireCustomerAuth(request);
      if (!customerAuth.authorized || customerAuth.phone !== phone) {
        return NextResponse.json(
          { error: "인증이 필요합니다. 다시 로그인해주세요." },
          { status: 401 }
        );
      }
    } else {
      const adminAuth = await requireAdminAuth(request);
      if (!adminAuth.authorized) {
        return NextResponse.json(
          { error: "관리자 인증이 필요합니다." },
          { status: 401 }
        );
      }
    }

    let query = supabaseAdmin
      .from('documents')
      .select('*');

    if (phone) {
      query = query.eq('phone', phone);
    }
    if (name) {
      query = query.eq('name', name);
    }

    query = query.order('uploaded_at', { ascending: false });

    const { data: documents, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "서류 조회 실패: " + error.message },
        { status: 500 }
      );
    }

    const isCustomerRequest = !!phone;
    const docs = documents || [];

    let signedUrlMap: Record<string, string> = {};

    if (isCustomerRequest) {
      const storagePaths = docs
        .map((d: any) => d.file_url || '')
        .filter((p: string) => p && !p.startsWith('http'));

      if (storagePaths.length > 0) {
        const { data: signedUrls } = await supabaseAdmin!.storage
          .from('documents')
          .createSignedUrls(storagePaths, 3600);

        if (signedUrls) {
          signedUrls.forEach((item: any) => {
            if (item.signedUrl && item.path) {
              signedUrlMap[item.path] = item.signedUrl;
            }
          });
        }
      }
    }

    const formattedDocuments = docs.map((doc: any) => {
      const rawUrl = doc.file_url || '';

      let fileUrl: string;
      if (isCustomerRequest && signedUrlMap[rawUrl]) {
        fileUrl = signedUrlMap[rawUrl];
      } else {
        fileUrl = `/api/documents/file?id=${doc.id}`;
      }

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
