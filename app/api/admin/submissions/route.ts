import { NextRequest, NextResponse } from "next/server";
import { adminAuthMiddleware } from "@/lib/middleware";
import { supabaseAdmin } from "@/lib/supabase";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 인증 체크
  const authError = await adminAuthMiddleware(request);
  if (authError) return authError;
  
  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available");
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json([], { status: 200 });
    }

    // Supabase에서 가져온 데이터를 기존 형식으로 변환
    const submissions = (data || []).map((submission: any) => ({
      id: submission.id, // ID 추가 (삭제용)
      name: submission.name,
      phone: submission.phone,
      age: submission.age_group ? parseInt(submission.age_group) : undefined,
      totalDebt: submission.total_debt,
      monthlyIncome: submission.monthly_income,
      monthlyExpense: undefined, // 기존 데이터에 없을 수 있음
      assets: submission.assets,
      employmentStatus: undefined, // 기존 데이터에 없을 수 있음
      debtType: undefined, // 기존 데이터에 없을 수 있음
      additionalInfo: undefined,
      ageGroup: submission.age_group,
      debtIncrease: submission.debt_increase,
      seizureStatus: submission.seizure_status,
      creditors: submission.creditors,
      dependents: submission.dependents,
      result: {
        eligible: submission.eligible,
        explanation: submission.explanation || '',
        recommendation: submission.recommendation || '',
      },
      submittedAt: submission.submitted_at,
    }));

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
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const index = searchParams.get("index"); // 기존 호환성을 위해 index도 지원

    // ID로 삭제 (우선)
    if (id) {
      const { error: deleteError } = await supabaseAdmin
        .from('submissions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error("Error deleting submission:", deleteError);
        return NextResponse.json(
          { error: "삭제 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Index로 삭제 (기존 방식 호환)
    if (index !== null) {
      // 모든 제출 내역 가져오기
      const { data: submissions, error: fetchError } = await supabaseAdmin
        .from('submissions')
        .select('id')
        .order('submitted_at', { ascending: false });

      if (fetchError || !submissions) {
        return NextResponse.json(
          { error: "제출 내역을 불러올 수 없습니다." },
          { status: 500 }
        );
      }

      const itemIndex = parseInt(index, 10);
      if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= submissions.length) {
        return NextResponse.json(
          { error: "유효하지 않은 인덱스입니다." },
          { status: 400 }
        );
      }

      const submissionId = submissions[itemIndex].id;

      const { error: deleteError } = await supabaseAdmin
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (deleteError) {
        console.error("Error deleting submission:", deleteError);
        return NextResponse.json(
          { error: "삭제 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "삭제할 항목의 ID 또는 인덱스가 필요합니다." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
