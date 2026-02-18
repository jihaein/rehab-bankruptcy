import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

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

interface FactorAnalysis {
  label: string;
  value: string;
  analysis: string;
  impact: 'favorable' | 'neutral' | 'caution';
}

interface ProcedureInfo {
  suitability: 'high' | 'medium' | 'low';
  summary: string;
  personalPoints: string[];
  generalInfo: {
    description: string;
    process: string[];
    pros: string[];
    cons: string[];
    requirements: string[];
  };
}

interface DiagnosisResult {
  eligible: boolean;
  summary: string;
  recommendedProcedure: 'rehabilitation' | 'bankruptcy' | 'consult';
  factorAnalysis: FactorAnalysis[];
  rehabilitation: ProcedureInfo;
  bankruptcy: ProcedureInfo;
  importantNotes: string[];
  nextSteps: string[];
  explanation: string;
  recommendation: string;
}

function getDisplayValues(data: DiagnosisForm) {
  const { ageGroup, totalDebt, debtIncrease, monthlyIncome, seizureStatus, assets, creditors, dependents } = data;
  return {
    age: ageGroup === "over65" ? "65세 이상" : ageGroup === "50-65" ? "50~65세" : ageGroup === "30-50" ? "30~50세" : "30대 미만",
    debt: totalDebt === "over200m" ? "2억원 이상" : totalDebt === "100m-200m" ? "1억~2억원" : totalDebt === "5k-100m" ? "5천만원~1억원" : "5천만원 미만",
    increase: debtIncrease === "over5k" ? "5천만원 이상" : debtIncrease === "2k-5k" ? "2천~5천만원" : debtIncrease === "under2k" ? "2천만원 미만" : "없음",
    income: monthlyIncome === "under200" ? "200만원 미만" : monthlyIncome === "200-250" ? "200~250만원" : monthlyIncome === "250-300" ? "250~300만원" : "300만원 이상",
    seizure: seizureStatus === "seizure" ? "압류 진행 중" : seizureStatus === "collection" ? "독촉 수령 중" : "없음",
    asset: assets === "over100m" ? "1억원 이상" : assets === "5k-100m" ? "5천만원~1억원" : assets === "2k-5k" ? "2천~5천만원" : "2천만원 미만",
    creditor: creditors === "over11" ? "11곳 이상" : creditors === "5-10" ? "5~10곳" : "1~5곳",
    dependent: dependents === "over3" ? "3명 이상" : dependents === "2" ? "2명" : dependents === "1" ? "1명" : "없음",
  };
}

function evaluateEligibility(data: DiagnosisForm): DiagnosisResult {
  const { ageGroup, totalDebt, debtIncrease, monthlyIncome, seizureStatus, assets, creditors, dependents } = data;
  const labels = getDisplayValues(data);

  let score = 0;
  let rehabScore = 0;
  let bankruptcyScore = 0;

  const factorAnalysis: FactorAnalysis[] = [];
  const rehabPersonal: string[] = [];
  const bankruptcyPersonal: string[] = [];

  // --- 1. 연령대 ---
  if (ageGroup === "over65") {
    score += 1;
    bankruptcyScore += 2;
    factorAnalysis.push({
      label: "연령대", value: labels.age,
      analysis: "고령의 경우 3~5년 장기 변제계획을 이행하기 어려울 수 있어, 파산면책 절차가 현실적으로 더 적합할 수 있습니다.",
      impact: 'favorable'
    });
    bankruptcyPersonal.push("고령으로 장기 변제보다 파산면책의 부담이 적을 수 있습니다");
    rehabPersonal.push("3~5년간 변제 이행이 체력적·경제적으로 부담될 수 있습니다");
  } else if (ageGroup === "50-65") {
    score += 0.5;
    factorAnalysis.push({
      label: "연령대", value: labels.age,
      analysis: "은퇴 시기를 고려하여 변제 기간 중 소득 지속 가능성을 검토할 필요가 있습니다. 소득이 안정적이라면 개인회생도 가능합니다.",
      impact: 'neutral'
    });
  } else if (ageGroup === "30-50") {
    rehabScore += 1;
    factorAnalysis.push({
      label: "연령대", value: labels.age,
      analysis: "경제활동이 활발한 연령대입니다. 안정적 소득이 있다면 개인회생을 통해 재산을 유지하면서 채무를 조정할 수 있는 가능성이 있습니다.",
      impact: 'neutral'
    });
    rehabPersonal.push("소득 활동이 가능한 연령대로 변제계획 이행에 유리합니다");
  } else {
    rehabScore += 0.5;
    factorAnalysis.push({
      label: "연령대", value: labels.age,
      analysis: "젊은 연령대로 향후 소득 증가 가능성이 있습니다. 소득이 있다면 개인회생을 통한 조기 재기가 가능할 수 있습니다.",
      impact: 'neutral'
    });
  }

  // --- 2. 총 채무 규모 ---
  if (totalDebt === "over200m") {
    score += 3;
    factorAnalysis.push({
      label: "총 채무 규모", value: labels.debt,
      analysis: "채무 규모가 상당합니다. 개인회생의 경우 무담보채무 5억원, 담보채무 10억원 한도가 있으므로 채무 구성에 따라 적용 여부가 달라질 수 있습니다. 자력 상환이 어려운 수준이라면 법적 절차를 적극 검토할 필요가 있습니다.",
      impact: 'favorable'
    });
    rehabPersonal.push("채무액이 크므로 변제계획을 통해 상당 부분 감면받을 수 있습니다");
    bankruptcyPersonal.push("자력 상환이 현실적으로 어려운 수준이므로 면책 대상이 될 수 있습니다");
  } else if (totalDebt === "100m-200m") {
    score += 2;
    factorAnalysis.push({
      label: "총 채무 규모", value: labels.debt,
      analysis: "상당한 채무 규모로, 소득 대비 상환이 어려운 상황이라면 법적 채무 조정 절차를 고려해볼 수 있습니다.",
      impact: 'favorable'
    });
    rehabPersonal.push("개인회생 채무 한도 내에 있어 신청 자격에 해당할 수 있습니다");
    bankruptcyPersonal.push("소득 수준에 비해 채무가 크다면 파산면책 대상이 될 수 있습니다");
  } else if (totalDebt === "5k-100m") {
    score += 1;
    factorAnalysis.push({
      label: "총 채무 규모", value: labels.debt,
      analysis: "중간 수준의 채무입니다. 소득과 재산 상황에 따라 개인회생 또는 파산면책 모두 고려할 수 있으나, 신용회복위원회의 채무조정이나 워크아웃 등도 함께 검토해볼 수 있습니다.",
      impact: 'neutral'
    });
  } else {
    factorAnalysis.push({
      label: "총 채무 규모", value: labels.debt,
      analysis: "채무 규모가 상대적으로 작은 편입니다. 채무조정 제도나 워크아웃 등 다른 방안을 먼저 검토해보는 것도 방법입니다. 다만, 소득이 매우 낮아 상환 자체가 어렵다면 법적 절차도 가능할 수 있습니다.",
      impact: 'caution'
    });
  }

  // --- 3. 최근 1년 채무 증가 ---
  if (debtIncrease === "over5k") {
    score += 2;
    factorAnalysis.push({
      label: "최근 채무 증가", value: labels.increase,
      analysis: "최근 1년간 채무가 빠르게 증가하고 있어 재정 상황이 급격히 악화되고 있는 것으로 보입니다. 이자와 연체료 누적을 고려할 때, 조기에 법적 절차를 검토하는 것이 추가 피해를 줄이는 데 도움이 될 수 있습니다.",
      impact: 'favorable'
    });
  } else if (debtIncrease === "2k-5k") {
    score += 1;
    factorAnalysis.push({
      label: "최근 채무 증가", value: labels.increase,
      analysis: "채무가 증가 추세에 있습니다. 이자와 연체료로 인한 추가 부담이 발생하기 전에 대응 방안을 마련하는 것이 좋습니다.",
      impact: 'neutral'
    });
  } else if (debtIncrease === "under2k") {
    factorAnalysis.push({
      label: "최근 채무 증가", value: labels.increase,
      analysis: "소폭 증가 중입니다. 현재 상환 능력이 부족하여 이자가 누적되고 있다면 법적 절차를 검토할 시점일 수 있습니다.",
      impact: 'neutral'
    });
  } else {
    score -= 1;
    factorAnalysis.push({
      label: "최근 채무 증가", value: labels.increase,
      analysis: "채무가 증가하지 않고 있어 재정 상황이 비교적 안정적입니다. 다만 현재 원금 상환이 어려운 상황이라면 법적 절차 검토도 가능합니다.",
      impact: 'caution'
    });
  }

  // --- 4. 월 실수령 소득 ---
  if (monthlyIncome === "under200") {
    score += 3;
    bankruptcyScore += 3;
    rehabScore -= 1;
    factorAnalysis.push({
      label: "월 실수령 소득", value: labels.income,
      analysis: "소득이 낮은 편으로, 개인회생에 필요한 변제금을 납부하기 어려울 수 있습니다. 파산면책 절차가 더 현실적인 선택지가 될 수 있습니다. 다만 소액이라도 정기적 수입이 있다면 개인회생도 검토 가능합니다.",
      impact: 'favorable'
    });
    bankruptcyPersonal.push("낮은 소득으로 변제 능력이 부족하여 파산면책 요건에 해당할 수 있습니다");
    rehabPersonal.push("소득이 낮아 변제계획 수립이 어려울 수 있습니다");
  } else if (monthlyIncome === "200-250") {
    score += 2;
    bankruptcyScore += 1;
    rehabScore += 1;
    factorAnalysis.push({
      label: "월 실수령 소득", value: labels.income,
      analysis: "최저생계비 수준의 소득입니다. 부양가족 수에 따라 개인회생 변제금 납부가 가능할 수도, 어려울 수도 있어 정확한 가용소득 계산이 필요합니다. 파산면책과 개인회생 모두 검토 대상입니다.",
      impact: 'favorable'
    });
    rehabPersonal.push("소득은 있으나 변제 여력이 제한적일 수 있습니다");
    bankruptcyPersonal.push("소득이 최저생계비 수준이라 파산 요건에 해당할 수도 있습니다");
  } else if (monthlyIncome === "250-300") {
    score += 1;
    rehabScore += 3;
    bankruptcyScore -= 1;
    factorAnalysis.push({
      label: "월 실수령 소득", value: labels.income,
      analysis: "안정적 소득이 있어 개인회생을 통한 변제계획 수립이 가능할 수 있습니다. 생활비와 부양가족을 고려한 가용소득에 따라 월 변제금이 결정됩니다.",
      impact: 'favorable'
    });
    rehabPersonal.push("안정적 소득으로 변제계획 이행이 가능할 수 있습니다");
    bankruptcyPersonal.push("소득이 있으므로 파산보다 개인회생이 우선 검토될 수 있습니다");
  } else {
    score -= 1;
    rehabScore += 3;
    bankruptcyScore -= 2;
    factorAnalysis.push({
      label: "월 실수령 소득", value: labels.income,
      analysis: "비교적 안정적인 소득이 있습니다. 개인회생 시 변제금이 높아질 수 있으나, 재산을 유지하면서 채무를 조정할 수 있습니다. 파산의 경우 '변제 능력이 있음에도 파산을 신청한다'는 이유로 면책이 제한될 수 있습니다.",
      impact: 'neutral'
    });
    rehabPersonal.push("충분한 소득으로 변제계획 수립에 유리합니다");
    bankruptcyPersonal.push("일정 수준 이상의 소득이 있어 파산면책이 제한될 수 있습니다");
  }

  // --- 5. 압류·독촉 상태 ---
  if (seizureStatus === "seizure") {
    score += 3;
    factorAnalysis.push({
      label: "압류·독촉 상태", value: labels.seizure,
      analysis: "압류가 진행 중인 긴급한 상황입니다. 개인회생 또는 파산 신청과 동시에 금지명령신청서를 제출하면, 통상 3일 이내에 법원에서 금지명령이 내려져 압류와 독촉으로부터 즉시 벗어날 수 있습니다. 빠른 법적 대응이 중요합니다.",
      impact: 'favorable'
    });
    rehabPersonal.push("회생 신청 시 금지명령을 통해 압류·독촉을 즉시 중단시킬 수 있습니다");
    bankruptcyPersonal.push("파산 신청 시 금지명령을 통해 압류·독촉을 즉시 중단시킬 수 있습니다");
  } else if (seizureStatus === "collection") {
    score += 1;
    factorAnalysis.push({
      label: "압류·독촉 상태", value: labels.seizure,
      analysis: "독촉을 받고 있는 상태로, 대응하지 않으면 향후 압류로 이어질 수 있습니다. 개인회생 또는 파산 신청과 함께 금지명령신청서를 제출하면, 통상 3일 이내에 법원의 금지명령이 내려져 독촉과 추심으로부터 벗어날 수 있습니다.",
      impact: 'neutral'
    });
    rehabPersonal.push("회생 신청 시 금지명령으로 독촉·추심을 중단시킬 수 있습니다");
    bankruptcyPersonal.push("파산 신청 시 금지명령으로 독촉·추심을 중단시킬 수 있습니다");
  } else {
    score -= 1;
    factorAnalysis.push({
      label: "압류·독촉 상태", value: labels.seizure,
      analysis: "현재 압류나 독촉이 없어 비교적 여유가 있는 상태입니다. 이 시기에 미리 법적 절차를 준비하면 더 유리한 조건에서 진행할 수 있습니다.",
      impact: 'caution'
    });
  }

  // --- 6. 재산 규모 ---
  if (assets === "under2k") {
    score += 2;
    bankruptcyScore += 2;
    factorAnalysis.push({
      label: "재산 규모", value: labels.asset,
      analysis: "보유 재산이 적은 편으로, 파산 절차에서 환가(처분)되는 재산이 거의 없을 수 있어 파산면책이 유리할 수 있습니다. 개인회생의 경우에도 청산가치가 낮아 변제금이 적게 산정될 수 있습니다.",
      impact: 'favorable'
    });
    bankruptcyPersonal.push("재산이 적어 파산 시 실질적으로 잃을 재산이 거의 없습니다");
  } else if (assets === "2k-5k") {
    score += 1;
    factorAnalysis.push({
      label: "재산 규모", value: labels.asset,
      analysis: "일부 재산이 있으나 채무에 비해 부족할 수 있습니다. 개인회생 시 재산을 유지할 수 있고, 파산 시에는 자유재산 범위 내에서 보호받을 수 있습니다.",
      impact: 'neutral'
    });
    rehabPersonal.push("재산을 유지하면서 채무를 조정할 수 있습니다");
  } else if (assets === "5k-100m") {
    rehabScore += 1;
    factorAnalysis.push({
      label: "재산 규모", value: labels.asset,
      analysis: "일정 재산을 보유하고 있습니다. 개인회생 시 재산을 유지할 수 있으나 청산가치 이상을 변제해야 합니다. 파산 시에는 자유재산을 제외한 재산이 환가될 수 있습니다.",
      impact: 'neutral'
    });
    rehabPersonal.push("재산 유지가 가능하지만 청산가치 이상 변제가 필요합니다");
    bankruptcyPersonal.push("파산 시 자유재산 외 재산이 처분될 수 있습니다");
  } else {
    score -= 2;
    rehabScore += 2;
    bankruptcyScore -= 1;
    factorAnalysis.push({
      label: "재산 규모", value: labels.asset,
      analysis: "상당한 재산을 보유하고 있습니다. 파산 시 대부분의 재산이 환가되므로, 재산 보전이 중요하다면 개인회생이 유리합니다. 다만 개인회생 시 청산가치가 높아 변제금이 증가할 수 있습니다.",
      impact: 'caution'
    });
    rehabPersonal.push("재산을 지키면서 진행할 수 있지만 변제금이 높아질 수 있습니다");
    bankruptcyPersonal.push("재산이 상당하여 파산 시 대부분 환가 대상이 됩니다");
  }

  // --- 7. 채권자 수 ---
  if (creditors === "over11") {
    score += 2;
    factorAnalysis.push({
      label: "채권자 수", value: labels.creditor,
      analysis: "채권자가 많아 개별 협상이 현실적으로 어려운 상황입니다. 법적 절차를 통해 모든 채무를 일괄 정리하는 것이 효율적입니다.",
      impact: 'favorable'
    });
  } else if (creditors === "5-10") {
    score += 1;
    factorAnalysis.push({
      label: "채권자 수", value: labels.creditor,
      analysis: "다수의 채권자가 있어 개별 대응보다 법적 절차를 통한 일괄 처리가 효과적일 수 있습니다.",
      impact: 'neutral'
    });
  } else {
    factorAnalysis.push({
      label: "채권자 수", value: labels.creditor,
      analysis: "채권자 수가 적은 편입니다. 상환 자체가 어렵다면 법적 절차가 여전히 필요할 수 있습니다.",
      impact: 'neutral'
    });
  }

  // --- 8. 부양가족 ---
  if (dependents === "over3") {
    score += 1;
    rehabScore += 1;
    factorAnalysis.push({
      label: "부양가족 수", value: labels.dependent,
      analysis: "부양가족이 많아 최저생계비가 높게 인정됩니다. 개인회생 시 가용소득(소득 - 생계비)이 줄어들어 변제금이 낮아질 수 있고, 파산 시에도 자유재산이 더 넓게 인정될 수 있습니다.",
      impact: 'favorable'
    });
    rehabPersonal.push("부양가족으로 인해 변제금이 낮게 산정될 수 있습니다");
  } else if (dependents === "2" || dependents === "1") {
    rehabScore += 0.5;
    factorAnalysis.push({
      label: "부양가족 수", value: labels.dependent,
      analysis: `${labels.dependent}의 부양가족이 있어 생계비 산정에 반영됩니다. 부양가족이 있으면 개인회생 시 인정되는 생계비가 증가합니다.`,
      impact: 'neutral'
    });
  } else {
    score -= 1;
    factorAnalysis.push({
      label: "부양가족 수", value: labels.dependent,
      analysis: "부양가족이 없어 생계비가 1인 기준으로 산정됩니다. 개인회생 시 가용소득이 상대적으로 높게 산정되어 변제금이 다소 높아질 수 있습니다.",
      impact: 'neutral'
    });
  }

  // --- 종합 판단 ---
  const eligible = score >= 3;

  let recommendedProcedure: 'rehabilitation' | 'bankruptcy' | 'consult';
  if (bankruptcyScore > rehabScore + 2) {
    recommendedProcedure = 'bankruptcy';
  } else if (rehabScore > bankruptcyScore + 2) {
    recommendedProcedure = 'rehabilitation';
  } else {
    recommendedProcedure = 'consult';
  }

  const rehabSuitability: 'high' | 'medium' | 'low' = rehabScore >= 4 ? 'high' : rehabScore >= 2 ? 'medium' : 'low';
  const bankruptcySuitability: 'high' | 'medium' | 'low' = bankruptcyScore >= 4 ? 'high' : bankruptcyScore >= 2 ? 'medium' : 'low';

  // --- 요약문 ---
  let summary: string;
  if (!eligible) {
    summary = "입력하신 정보를 종합 분석한 결과, 현재 상황에서는 법적 채무 조정 절차의 필요성이 상대적으로 낮을 수 있습니다. 다만 개인 상황에 따라 결과가 달라질 수 있으므로 전문가 상담을 권장합니다.";
  } else if (recommendedProcedure === 'bankruptcy') {
    summary = "입력하신 정보를 종합 분석한 결과, 파산면책 절차가 귀하의 상황에 더 적합할 수 있습니다. 정확한 판단을 위해 전문가 상담을 권장합니다.";
  } else if (recommendedProcedure === 'rehabilitation') {
    summary = "입력하신 정보를 종합 분석한 결과, 개인회생 절차가 귀하의 상황에 더 적합할 수 있습니다. 정확한 판단을 위해 전문가 상담을 권장합니다.";
  } else {
    summary = "입력하신 정보를 종합 분석한 결과, 개인회생과 파산면책 모두 검토해볼 수 있는 상황입니다. 어떤 절차가 더 유리한지는 전문가의 정확한 판단이 필요합니다.";
  }

  // --- 중요 안내사항 ---
  const importantNotes = [
    "본 진단은 입력하신 정보만을 기반으로 한 일반적인 참고 자료이며, 법적 효력이 없습니다.",
    "실제 회생·파산 신청 시에는 정확한 채무 내역, 소득 증빙, 재산 목록 등 상세 자료를 바탕으로 법원이 최종 판단합니다.",
    "면책불허가 사유(도박, 과소비 등으로 인한 채무)가 있을 경우 결과가 달라질 수 있습니다.",
    "개인 상황에 따라 결과가 크게 달라질 수 있으므로, 반드시 전문가와 상담하시기 바랍니다.",
  ];

  // --- 다음 단계 ---
  const nextSteps: string[] = [];
  if (seizureStatus === "seizure" || seizureStatus === "collection") {
    nextSteps.push("압류·독촉을 받고 계시므로 가능한 빨리 전문가에게 연락하세요. 신청과 동시에 금지명령신청서를 제출하면 통상 3일 이내에 압류·독촉이 중단됩니다.");
  }
  nextSteps.push("전문 법무사와의 무료 상담을 통해 정확한 자격 요건과 예상 결과를 확인하세요.");
  nextSteps.push("상담 전 소득증명서, 신용정보조회서(채무증명), 재산 관련 서류를 준비하시면 보다 정확한 상담이 가능합니다.");

  // --- 개인회생 분석 ---
  const rehabilitation: ProcedureInfo = {
    suitability: rehabSuitability,
    summary: rehabScore >= 4
      ? "귀하의 소득 수준과 재정 상황을 고려할 때, 개인회생을 통해 채무를 조정할 수 있는 가능성이 있습니다."
      : rehabScore >= 2
        ? "개인회생 적용 가능성이 있으나, 소득 및 변제 능력에 대한 구체적인 검토가 필요합니다."
        : "현재 상황에서는 개인회생보다 다른 절차가 더 적합할 수 있으나, 전문가 검토를 통해 확인해보시기 바랍니다.",
    personalPoints: rehabPersonal,
    generalInfo: {
      description: "법원이 인가한 변제계획에 따라 3년(급여소득자) 또는 5년(영업소득자) 동안 일정 금액을 변제한 후 나머지 채무를 면책받는 절차입니다.",
      process: [
        "법무사 상담 및 서류 준비",
        "법원에 개인회생 신청",
        "개시결정 (신청 후 약 1~2개월) → 채권자 추심·압류 중단",
        "변제계획안 제출 및 채권자 이의 기간",
        "법원 인가결정 (신청 후 약 3~6개월)",
        "변제계획에 따라 매월 변제금 납부 (3~5년간)",
        "변제 완료 후 잔여 채무 면책",
      ],
      pros: [
        "주택, 차량 등 재산을 유지하면서 진행 가능",
        "채무의 상당 부분(경우에 따라 최대 90%)을 감면받을 수 있음",
        "채권자의 압류·추심이 중단됨",
        "변제 완료 시 잔여 채무 전액 면책",
        "신용 회복이 비교적 빠름",
      ],
      cons: [
        "3~5년간 변제계획을 성실히 이행해야 함",
        "변제 기간 중 재산 처분이나 새로운 채무가 제한됨",
        "안정적인 소득이 필요",
        "보유 재산가치(청산가치) 이상을 변제해야 함",
      ],
      requirements: [
        "급여소득 또는 영업소득 등 정기적 수입이 있을 것",
        "무담보채무 5억원, 담보채무 10억원 이하",
        "채무를 변제할 수 있는 가용소득이 있을 것",
      ],
    },
  };

  // --- 파산면책 분석 ---
  const bankruptcy: ProcedureInfo = {
    suitability: bankruptcySuitability,
    summary: bankruptcyScore >= 4
      ? "소득과 재산 상황을 고려할 때, 파산면책을 통해 채무에서 벗어날 수 있는 가능성이 있습니다."
      : bankruptcyScore >= 2
        ? "파산면책 적용 가능성이 있으나, 면책 요건에 대한 구체적인 검토가 필요합니다."
        : "현재 상황에서 파산면책보다 다른 절차가 더 적합할 수 있으나, 전문가 검토를 통해 확인해보시기 바랍니다.",
    personalPoints: bankruptcyPersonal,
    generalInfo: {
      description: "채무를 변제할 수 없는 상태(지급불능)임을 법원에서 인정받아, 면책 결정을 통해 채무 전부를 면제받는 절차입니다.",
      process: [
        "법무사 상담 및 서류 준비",
        "법원에 파산·면책 동시 신청",
        "파산심문기일 (신청 후 약 2~4개월)",
        "파산 선고 → 채권자 추심·압류 중단",
        "면책심문기일 (파산 선고 후 약 2~3개월)",
        "면책 결정 → 대부분의 채무 면제",
        "면책 확정 (이의 없으면 약 2주 후)",
      ],
      pros: [
        "대부분의 채무를 전액 면제받을 수 있음",
        "별도의 변제 기간 없이 면책 후 새 출발 가능",
        "소득이 없거나 매우 낮아도 신청 가능",
        "파산 신청 시 채권자의 압류·추심이 중단됨",
      ],
      cons: [
        "자유재산을 제외한 재산이 환가(처분)될 수 있음",
        "파산 선고 시 일부 자격 제한 (면책 후 해소)",
        "면책불허가 사유(도박·사치 등)에 해당하면 면책이 제한될 수 있음",
        "신용 회복에 상대적으로 시간이 더 소요될 수 있음",
      ],
      requirements: [
        "채무를 변제할 수 없는 지급불능 상태일 것",
        "면책불허가 사유에 해당하지 않을 것",
        "성실한 채무자로서의 요건을 갖출 것",
      ],
    },
  };

  // --- DB 저장용 텍스트 (backward compatible) ---
  let explanationText = `${summary}\n\n`;
  explanationText += `[상황 분석]\n`;
  factorAnalysis.forEach(f => {
    explanationText += `• ${f.label} (${f.value}): ${f.analysis}\n`;
  });
  explanationText += `\n[추천 절차] ${recommendedProcedure === 'rehabilitation' ? '개인회생' : recommendedProcedure === 'bankruptcy' ? '파산면책' : '전문가 상담 후 결정'}\n`;
  explanationText += `• 개인회생 적합도: ${rehabSuitability === 'high' ? '높음' : rehabSuitability === 'medium' ? '보통' : '낮음'}\n`;
  explanationText += `• 파산면책 적합도: ${bankruptcySuitability === 'high' ? '높음' : bankruptcySuitability === 'medium' ? '보통' : '낮음'}`;

  const recommendationText = nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');

  return {
    eligible,
    summary,
    recommendedProcedure,
    factorAnalysis,
    rehabilitation,
    bankruptcy,
    importantNotes,
    nextSteps,
    explanation: explanationText,
    recommendation: recommendationText,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다." },
        { status: 500 }
      );
    }

    const formData: DiagnosisForm = await request.json();

    if (!formData.privacyConsent) {
      return NextResponse.json(
        { error: "개인정보 수집 및 이용에 동의해주세요." },
        { status: 400 }
      );
    }

    const result = evaluateEligibility(formData);

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
      console.error("Error saving submission:", insertError);
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
