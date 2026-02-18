import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { validateFileUpload } from "@/lib/middleware";
import { supabaseAdmin } from "@/lib/supabase";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

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

    // 고객 ID 찾기 (전화번호로)
    const { data: customers, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .limit(1);

    let customerId: string | null = null;
    if (customers && customers.length > 0) {
      customerId = customers[0].id;
    }

    // 기존 문서 목록 가져오기 (수정 이력용)
    const { data: existingDocuments } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('phone', phone);

    const uploadedDocuments: any[] = [];

    // 각 서류 유형별로 파일 처리
    for (const documentType of documentTypes) {
      const files = formData.getAll(`files_${documentType}`) as File[];

      if (!files || files.length === 0) {
        continue;
      }

      // 기존에 같은 서류 유형의 문서가 있는지 확인
      const existingDoc = existingDocuments?.find(
        (doc: any) => doc.document_type === documentType
      );

      let editHistory: any[] = [];
      if (existingDoc) {
        // 기존 문서의 수정 이력 가져오기
        editHistory = existingDoc.edit_history || [];
        
        // 수정 로그 추가
        editHistory.push({
          action: "수정",
          previous_file_name: existingDoc.file_name,
          previous_file_url: existingDoc.file_url,
          modified_at: new Date().toISOString(),
        });

        // 기존 문서 삭제 (Supabase Storage의 파일은 나중에 정리)
        await supabaseAdmin
          .from('documents')
          .delete()
          .eq('id', existingDoc.id);
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

        const fileBuffer = await file.arrayBuffer();
        
        // 파일 확장자 추출
        const originalName = file.name;
        const ext = originalName.substring(originalName.lastIndexOf('.'));
        const fileName = `${randomUUID()}${ext}`;
        
        // Supabase Storage 경로: phone/fileName (한글 불가하므로 서류타입 제외)
        const sanitizedPhone = phone.replace(/[^0-9]/g, "");
        const filePath = `${sanitizedPhone}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('documents')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          return NextResponse.json(
            { error: "파일 업로드 실패: " + uploadError.message },
            { status: 500 }
          );
        }
        
        const documentData = {
          id: randomUUID(),
          customer_id: customerId,
          name,
          phone,
          document_type: documentType,
          file_name: originalName,
          file_url: filePath,
          uploaded_at: new Date().toISOString(),
          status: status as "draft" | "submitted",
          edit_history: editHistory.length > 0 ? editHistory : null,
        };

        const { data: insertedDoc, error: dbError } = await supabaseAdmin
          .from('documents')
          .insert([documentData])
          .select()
          .single();

        if (dbError) {
          return NextResponse.json(
            { error: "문서 정보 저장 실패: " + dbError.message },
            { status: 500 }
          );
        }
        
        const document = {
          id: insertedDoc.id,
          name: insertedDoc.name,
          phone: insertedDoc.phone,
          documentType: insertedDoc.document_type,
          fileName: insertedDoc.file_name,
          savedFileName: fileName,
          fileUrl: `/api/documents/file?file=${encodeURIComponent(insertedDoc.file_url)}`,
          uploadedAt: insertedDoc.uploaded_at,
          status: insertedDoc.status,
          privacyConsent: true,
          editHistory: insertedDoc.edit_history,
        };

        uploadedDocuments.push(document);
      }
    }

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
