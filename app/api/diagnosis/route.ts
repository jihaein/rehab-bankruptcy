import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

// 동적 라우트로 강제 설정 (Next.js 14)
export const dynamic = 'force-dynamic';

interface DiagnosisForm {
  name: string;
  phone: string;
  ageGroup: string;
  totalDebt: string;
  debtIncrease: string;
  monthlyIncome: string;
  seizureStatus: string;
  assets: string;
  creditors: string;
  dependents: string;
  additionalInfo: string;
  privacyConsent: boolean;
}

// AI 판단 로직 (회생파산 자격요건 기준)
function evaluateEligibility(data: DiagnosisForm): {
  eligible: boolean;
  explanation: string;
  recommendation: string;
} {
  const {
    ageGroup,
    totalDebt,
    debtIncrease,
    monthlyIncome,
    seizureStatus,
    assets,
    creditors,
    dependents,
  } = data;

  let eligible = true;
  const reasons: string[] = [];
  const positives: string[] = [];
  let score = 0; // 점수 기반 판단

  // 0. 나이대 분석
  if (ageGroup === "over65") {
    score += 1;
    positives.push("65세 이상으로 고령층에 해당하여 회생파산 절차를 고려할 수 있습니다.");
  } else if (ageGroup === "50-65") {
    score += 0.5;
    positives.push("50~65세로 중장년층에 해당합니다.");
  }

  // 1. 총 채무 규모 분석
  if (totalDebt === "over200m") {
    score += 3;
    positives.push("채무 규모가 2억 이상으로 상당하여 회생파산 절차가 적절할 수 있습니다.");
  } else if (totalDebt === "100m-200m") {
    score += 2;
    positives.push("채무 규모가 1억~2억원으로 회생파산 절차를 고려할 수 있습니다.");
  } else if (totalDebt === "5k-100m") {
    score += 1;
    positives.push("채무 규모가 5천만원~1억원으로 다른 해결 방안도 고려해볼 수 있습니다.");
  } else {
    reasons.push("채무 규모가 5천만원 미만으로 상대적으로 작아 다른 해결 방안을 먼저 검토해볼 수 있습니다.");
  }

  // 2. 최근 1년 채무 증가 분석
  if (debtIncrease === "over5k") {
    score += 2;
    positives.push("최근 1년간 채무가 5천만원 이상 증가하여 재정 상황이 악화되고 있습니다.");
  } else if (debtIncrease === "2k-5k") {
    score += 1;
    positives.push("최근 1년간 채무가 지속적으로 증가하고 있습니다.");
  } else if (debtIncrease === "none") {
    score -= 1;
    positives.push("최근 1년간 채무 증가가 없어 재정 상황이 안정적입니다.");
  }

  // 3. 월 실수령 소득 분석
  if (monthlyIncome === "under200") {
    score += 3;
    positives.push("월 실수령 소득이 200만원 미만으로 매우 낮아 파산 절차를 고려할 수 있습니다.");
  } else if (monthlyIncome === "200-250") {
    score += 2;
    positives.push("월 실수령 소득이 200~250만원으로 낮아 재정적 어려움이 있습니다.");
  } else if (monthlyIncome === "250-300") {
    score += 1;
    positives.push("월 실수령 소득이 250~300만원으로 개인회생 절차가 적합할 수 있습니다.");
  } else {
    score -= 1;
    positives.push("월 실수령 소득이 300만원 이상으로 안정적이어서 상환 가능성이 있습니다.");
  }

  // 4. 압류·독촉 상태 분석
  if (seizureStatus === "seizure") {
    score += 3;
    positives.push("압류 상태로 심각한 재정 어려움을 겪고 있습니다.");
  } else if (seizureStatus === "collection") {
    score += 1;
    positives.push("독촉을 받고 있어 회생파산 절차를 고려할 수 있습니다.");
  } else {
    score -= 1;
    positives.push("압류나 독촉이 없는 상태로 아직 여유가 있습니다.");
  }

  // 5. 재산 규모 분석
  if (assets === "under2k") {
    score += 2;
    positives.push("재산이 2천만원 미만으로 부채 상환에 충분하지 않을 수 있습니다.");
  } else if (assets === "2k-5k") {
    score += 1;
    positives.push("재산이 2천~5천만원으로 부채 상환에 충분하지 않을 수 있습니다.");
  } else if (assets === "over100m") {
    score -= 2;
    reasons.push("재산이 1억 이상으로 자산 처분을 통한 상환이 우선 고려될 수 있습니다.");
  }

  // 6. 채권자 수 분석
  if (creditors === "over11") {
    score += 2;
    positives.push("채권자가 11곳 이상으로 많아 회생파산 절차를 통한 일괄 처리가 효율적일 수 있습니다.");
  } else if (creditors === "5-10") {
    score += 1;
    positives.push("채권자가 5~10곳으로 회생파산 절차를 통한 일괄 처리가 효율적일 수 있습니다.");
  }

  // 7. 부양가족 수 분석
  if (dependents === "over3") {
    score += 1;
    positives.push("부양가족이 3명 이상으로 가계 부담이 큽니다.");
  } else if (dependents === "none") {
    score -= 1;
    positives.push("부양가족이 없어 개인 부담이 상대적으로 적습니다.");
  }

  // 종합 판단 (점수 5점 이상이면 가능)
  if (score >= 5) {
    eligible = true;
  } else if (score >= 3) {
    eligible = true;
    reasons.push("일부 조건이 양호하지만 전문가 상담을 통해 정확한 판단이 필요합니다.");
  } else {
    eligible = false;
  }

  // 설명 작성
  let explanation = "";
  let recommendation = "";

  if (eligible) {
    explanation = `입력하신 정보를 바탕으로 분석한 결과, 개인회생 또는 파산 면책 가능성이 있습니다.\n\n`;
    explanation += `주요 판단 근거:\n${positives.map((p) => `• ${p}`).join("\n")}\n\n`;
    
    if (reasons.length > 0) {
      explanation += `참고사항:\n${reasons.map((r) => `• ${r}`).join("\n")}\n\n`;
    }

    explanation += `입력 정보 요약:\n`;
    explanation += `• 나이대: ${
      ageGroup === "over65" ? "65세 이상" :
      ageGroup === "50-65" ? "50~65세" :
      ageGroup === "30-50" ? "30~50세" : "30대 미만"
    }\n`;
    explanation += `• 총 채무 규모: ${
      totalDebt === "over200m" ? "2억 이상" :
      totalDebt === "100m-200m" ? "1억~2억" :
      totalDebt === "5k-100m" ? "5천~1억" : "5천 미만"
    }\n`;
    explanation += `• 최근 1년 채무 증가: ${
      debtIncrease === "over5k" ? "5천 이상" :
      debtIncrease === "2k-5k" ? "2천~5천" :
      debtIncrease === "under2k" ? "2천 미만" : "없음"
    }\n`;
    explanation += `• 월 실수령 소득: ${
      monthlyIncome === "under200" ? "200 미만" :
      monthlyIncome === "200-250" ? "200~250" :
      monthlyIncome === "250-300" ? "250~300" : "300 이상"
    }만원\n`;
    explanation += `• 압류·독촉 상태: ${
      seizureStatus === "seizure" ? "압류" :
      seizureStatus === "collection" ? "독촉만" : "없음"
    }\n`;
    explanation += `• 재산 규모: ${
      assets === "over100m" ? "1억 이상" :
      assets === "5k-100m" ? "5천~1억" :
      assets === "2k-5k" ? "2천~5천" : "2천 미만"
    }\n`;
    explanation += `• 채권자 수: ${
      creditors === "over11" ? "11곳 이상" :
      creditors === "5-10" ? "5~10곳" : "1~5곳"
    }\n`;
    explanation += `• 부양가족 수: ${
      dependents === "over3" ? "3명 이상" :
      dependents === "2" ? "2명" :
      dependents === "1" ? "1명" : "없음"
    }\n`;

    if (monthlyIncome === "under200" || monthlyIncome === "200-250") {
      recommendation = `1. 파산 절차: 소득이 낮고 재산이 거의 없는 경우, 파산 절차를 통해 부채를 면제받을 수 있습니다.\n\n`;
    } else {
      recommendation = `1. 개인회생 절차: 정규 소득이 있고 상환 가능성이 있는 경우, 개인회생을 통해 부채를 조정하고 면책받을 수 있습니다.\n\n`;
    }
    recommendation += `2. 전문가 상담: 정확한 절차와 자격요건 확인을 위해 법무사와 상담하시는 것을 강력히 권장합니다.\n\n`;
    recommendation += `3. 서류 준비: 소득증명, 부채증명, 자산증명 등 필요한 서류를 미리 준비하시면 절차가 원활하게 진행됩니다.`;
  } else {
    explanation = `입력하신 정보를 바탕으로 분석한 결과, 현재 상황에서는 개인회생/파산 절차가 제한될 수 있습니다.\n\n`;
    explanation += `주요 제한 사항:\n${reasons.map((r) => `• ${r}`).join("\n")}\n\n`;
    
    if (positives.length > 0) {
      explanation += `긍정적 요소:\n${positives.map((p) => `• ${p}`).join("\n")}\n\n`;
    }

    explanation += `입력 정보 요약:\n`;
    explanation += `• 나이대: ${
      ageGroup === "over65" ? "65세 이상" :
      ageGroup === "50-65" ? "50~65세" :
      ageGroup === "30-50" ? "30~50세" : "30대 미만"
    }\n`;
    explanation += `• 총 채무 규모: ${
      totalDebt === "over200m" ? "2억 이상" :
      totalDebt === "100m-200m" ? "1억~2억" :
      totalDebt === "5k-100m" ? "5천~1억" : "5천 미만"
    }\n`;
    explanation += `• 월 실수령 소득: ${
      monthlyIncome === "under200" ? "200 미만" :
      monthlyIncome === "200-250" ? "200~250" :
      monthlyIncome === "250-300" ? "250~300" : "300 이상"
    }만원\n`;
    explanation += `• 재산 규모: ${
      assets === "over100m" ? "1억 이상" :
      assets === "5k-100m" ? "5천~1억" :
      assets === "2k-5k" ? "2천~5천" : "2천 미만"
    }\n`;

    recommendation = `1. 전문가 상담: 현재 상황에 맞는 개인회생 또는 파산 면책 가능성을 정확히 판단하기 위해 법무사와 상담하시는 것을 권장합니다.\n\n`;
    recommendation += `2. 재정 상황 재검토: 시간이 지나면서 재정 상황이 개선되면 개인회생 또는 파산 절차를 다시 검토해볼 수 있습니다.`;
  }

  return {
    eligible,
    explanation,
    recommendation,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available");
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다." },
        { status: 500 }
      );
    }

    const formData: DiagnosisForm = await request.json();

    // 개인정보 동의 확인
    if (!formData.privacyConsent) {
      return NextResponse.json(
        { error: "개인정보 수집 및 이용에 동의해주세요." },
        { status: 400 }
      );
    }

    // AI 판단 수행
    const result = evaluateEligibility(formData);

    // Supabase에 제출 정보 저장
    const submissionId = randomUUID();
    const submissionData = {
      id: submissionId,
      name: formData.name,
      phone: formData.phone,
      age_group: formData.ageGroup,
      total_debt: formData.totalDebt,
      debt_increase: formData.debtIncrease,
      monthly_income: formData.monthlyIncome,
      seizure_status: formData.seizureStatus,
      assets: formData.assets,
      creditors: formData.creditors,
      dependents: formData.dependents,
      eligible: result.eligible,
      explanation: result.explanation,
      recommendation: result.recommendation,
      submitted_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabaseAdmin
      .from('submissions')
      .insert(submissionData);

    if (insertError) {
      console.error("Error saving submission to Supabase:", insertError);
      return NextResponse.json(
        { error: "진단 결과 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing diagnosis:", error);
    return NextResponse.json(
      { error: "진단 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
