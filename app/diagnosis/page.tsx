"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DiagnosisForm>({
    name: "",
    phone: "",
    ageGroup: "",
    totalDebt: "",
    debtIncrease: "",
    monthlyIncome: "",
    seizureStatus: "",
    assets: "",
    creditors: "",
    dependents: "",
    additionalInfo: "",
  });

  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [result, setResult] = useState<{
    eligible: boolean;
    summary: string;
    recommendedProcedure: 'rehabilitation' | 'bankruptcy' | 'consult';
    factorAnalysis: Array<{
      label: string;
      value: string;
      analysis: string;
      impact: 'favorable' | 'neutral' | 'caution';
    }>;
    rehabilitation: {
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
    };
    bankruptcy: {
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
    };
    importantNotes: string[];
    nextSteps: string[];
  } | null>(null);

  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (id: string) => setOpenSection(prev => prev === id ? null : id);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyConsent) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, privacyConsent }),
      });

      const data = await response.json();
      setResult(data);
      setStep(9);
    } catch (error) {
      console.error("Error:", error);
      alert("진단 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "010-0000-0000";
    window.location.href = `tel:${phoneNumber.replace(/-/g, "")}`;
  };

  const suitabilityBadge = (level: 'high' | 'medium' | 'low') => {
    const styles = {
      high: "bg-emerald-100 text-emerald-700 border-emerald-200",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      low: "bg-slate-100 text-slate-600 border-slate-200",
    };
    const labels = { high: "적합도 높음", medium: "적합도 보통", low: "적합도 낮음" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const impactDot = (impact: 'favorable' | 'neutral' | 'caution') => {
    const colors = { favorable: "bg-emerald-500", neutral: "bg-slate-400", caution: "bg-amber-500" };
    return <span className={`inline-block w-2 h-2 rounded-full ${colors[impact]} mt-1.5 shrink-0`} />;
  };

  if (step === 9 && result) {
    const procLabel = result.recommendedProcedure === 'rehabilitation' ? '개인회생'
      : result.recommendedProcedure === 'bankruptcy' ? '파산면책' : '전문가 상담 후 결정';
    const isRehabRecommended = result.recommendedProcedure === 'rehabilitation';
    const isBankruptcyRecommended = result.recommendedProcedure === 'bankruptcy';

    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-8 py-6 text-center">
              <p className="text-slate-400 text-sm mb-1">회생·파산 무료 진단</p>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {formData.name}님의 분석 리포트
              </h1>
            </div>

            {/* Summary */}
            <div className="p-6 md:p-8">
              <div className={`p-5 rounded-lg border ${
                result.eligible
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    result.eligible ? "bg-emerald-100" : "bg-amber-100"
                  }`}>
                    {result.eligible ? (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-base font-bold mb-1 ${result.eligible ? "text-emerald-800" : "text-amber-800"}`}>
                      {result.eligible ? "회생·파산 절차 검토 대상" : "추가 검토 필요"}
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Recommended Procedure Badge */}
              {result.eligible && (
                <div className="mt-5 flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">우선 검토 절차</p>
                    <p className="text-sm font-bold text-indigo-900">{procLabel}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Procedure Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 pt-6 pb-2">
              <h2 className="text-lg font-bold text-slate-900">개인회생 vs 파산면책 비교</h2>
              <p className="text-xs text-slate-500 mt-1">귀하의 상황을 기반으로 분석한 각 절차의 적합도입니다.</p>
            </div>

            <div className="p-6 md:p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rehabilitation Card */}
              <div className={`rounded-lg border-2 p-5 ${
                isRehabRecommended ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">개인회생</h3>
                  {suitabilityBadge(result.rehabilitation.suitability)}
                </div>
                {isRehabRecommended && (
                  <div className="mb-3 px-2 py-1 bg-indigo-100 rounded text-xs font-semibold text-indigo-700 text-center">우선 검토 추천</div>
                )}
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{result.rehabilitation.summary}</p>

                {result.rehabilitation.personalPoints.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">귀하에게 해당되는 사항</p>
                    <ul className="space-y-1.5">
                      {result.rehabilitation.personalPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-indigo-500 mt-0.5 shrink-0">›</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 mt-3">
                  <button
                    onClick={() => toggleSection('rehab')}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <span>일반 정보 보기</span>
                    <svg className={`w-4 h-4 transition-transform ${openSection === 'rehab' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {openSection === 'rehab' && (
                    <div className="mt-3 space-y-3 text-sm">
                      <p className="text-slate-600 text-xs leading-relaxed">{result.rehabilitation.generalInfo.description}</p>
                      <div>
                        <p className="text-xs font-semibold text-indigo-700 mb-1.5">기본 절차</p>
                        <ol className="space-y-1">
                          {result.rehabilitation.generalInfo.process.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-indigo-400 font-semibold shrink-0">{i + 1}.</span>{p}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 mb-1">장점</p>
                        <ul className="space-y-1">
                          {result.rehabilitation.generalInfo.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-emerald-500 shrink-0">+</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-rose-700 mb-1">단점</p>
                        <ul className="space-y-1">
                          {result.rehabilitation.generalInfo.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-rose-500 shrink-0">-</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">주요 요건</p>
                        <ul className="space-y-1">
                          {result.rehabilitation.generalInfo.requirements.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-slate-400 shrink-0">•</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bankruptcy Card */}
              <div className={`rounded-lg border-2 p-5 ${
                isBankruptcyRecommended ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">파산면책</h3>
                  {suitabilityBadge(result.bankruptcy.suitability)}
                </div>
                {isBankruptcyRecommended && (
                  <div className="mb-3 px-2 py-1 bg-indigo-100 rounded text-xs font-semibold text-indigo-700 text-center">우선 검토 추천</div>
                )}
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{result.bankruptcy.summary}</p>

                {result.bankruptcy.personalPoints.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">귀하에게 해당되는 사항</p>
                    <ul className="space-y-1.5">
                      {result.bankruptcy.personalPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-indigo-500 mt-0.5 shrink-0">›</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 mt-3">
                  <button
                    onClick={() => toggleSection('bankruptcy')}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <span>일반 정보 보기</span>
                    <svg className={`w-4 h-4 transition-transform ${openSection === 'bankruptcy' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {openSection === 'bankruptcy' && (
                    <div className="mt-3 space-y-3 text-sm">
                      <p className="text-slate-600 text-xs leading-relaxed">{result.bankruptcy.generalInfo.description}</p>
                      <div>
                        <p className="text-xs font-semibold text-indigo-700 mb-1.5">기본 절차</p>
                        <ol className="space-y-1">
                          {result.bankruptcy.generalInfo.process.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-indigo-400 font-semibold shrink-0">{i + 1}.</span>{p}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 mb-1">장점</p>
                        <ul className="space-y-1">
                          {result.bankruptcy.generalInfo.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-emerald-500 shrink-0">+</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-rose-700 mb-1">단점</p>
                        <ul className="space-y-1">
                          {result.bankruptcy.generalInfo.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-rose-500 shrink-0">-</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">주요 요건</p>
                        <ul className="space-y-1">
                          {result.bankruptcy.generalInfo.requirements.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-slate-400 shrink-0">•</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Factor Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 pt-6 pb-2">
              <h2 className="text-lg font-bold text-slate-900">항목별 상세 분석</h2>
              <p className="text-xs text-slate-500 mt-1">입력하신 각 항목에 대한 분석입니다.</p>
            </div>
            <div className="px-6 md:px-8 pb-6">
              <div className="divide-y divide-slate-100">
                {result.factorAnalysis.map((factor, i) => (
                  <div key={i} className="py-4 first:pt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      {impactDot(factor.impact)}
                      <span className="text-sm font-semibold text-slate-900">{factor.label}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{factor.value}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed ml-4">{factor.analysis}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />유리한 요소</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" />중립</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />추가 검토 필요</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 pt-6 pb-2">
              <h2 className="text-lg font-bold text-slate-900">다음 단계</h2>
            </div>
            <div className="px-6 md:px-8 pb-6">
              <ol className="space-y-3">
                {result.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA */}
            <div className="px-6 md:px-8 pb-6">
              <div className="bg-slate-900 rounded-lg p-6 text-center">
                <h3 className="text-base font-bold text-white mb-2">
                  전문가 무료 상담 받기
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  진단 결과를 바탕으로 전문 법무사가 정확한 자격 요건과 예상 절차를 안내해드립니다.
                </p>
                <button
                  onClick={handleCall}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
                >
                  전화 상담 예약하기
                </button>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 md:px-8 py-5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">법적 고지사항</h3>
                  <ul className="space-y-1.5">
                    {result.importantNotes.map((note, i) => (
                      <li key={i} className="text-xs text-slate-500 leading-relaxed">• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="text-center pb-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  const renderQuestion = (
    questionNumber: number,
    title: string,
    name: string,
    options: { value: string; label: string }[]
  ) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-slate-900 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">
            {questionNumber}
          </span>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        <div className="space-y-2.5">
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-150 ${
                formData[name as keyof DiagnosisForm] === option.value
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={formData[name as keyof DiagnosisForm] === option.value}
                onChange={() => handleRadioChange(name, option.value)}
                className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                required
              />
              <span className={`text-sm font-medium ${
                formData[name as keyof DiagnosisForm] === option.value
                  ? "text-indigo-900"
                  : "text-slate-700"
              }`}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white tracking-tight text-center mb-2">
              회생·파산 무료 진단
            </h1>
            <p className="text-sm text-slate-400 text-center">
              몇 가지 질문에 답변해주시면 회생·파산 가능 여부를 확인해드립니다.
            </p>
          </div>

          {/* Progress */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    s <= step ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">
              {step} / 8
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-4">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    연락처 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-slate-900">연령대</h2>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { value: "under30", label: "30대 미만" },
                      { value: "30-50", label: "30~50세" },
                      { value: "50-65", label: "50~65세" },
                      { value: "over65", label: "65세 이상" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-150 ${
                          formData.ageGroup === option.value
                            ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="ageGroup"
                          value={option.value}
                          checked={formData.ageGroup === option.value}
                          onChange={() => handleRadioChange("ageGroup", option.value)}
                          className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          required
                        />
                        <span className={`text-sm font-medium ${
                          formData.ageGroup === option.value
                            ? "text-indigo-900"
                            : "text-slate-700"
                        }`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.phone || !formData.ageGroup}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  다음
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                {renderQuestion(1, "총 채무 규모", "totalDebt", [
                  { value: "under5k", label: "5천만원 미만" },
                  { value: "5k-100m", label: "5천만원 ~ 1억" },
                  { value: "100m-200m", label: "1억 ~ 2억" },
                  { value: "over200m", label: "2억 이상" },
                ])}
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button type="button" onClick={() => setStep(3)} disabled={!formData.totalDebt} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                    다음
                  </button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                {renderQuestion(2, "최근 1년 채무 증가 금액", "debtIncrease", [
                  { value: "none", label: "없음" },
                  { value: "under2k", label: "2천만원 미만" },
                  { value: "2k-5k", label: "2천만원 ~ 5천만원" },
                  { value: "over5k", label: "5천만원 이상" },
                ])}
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button type="button" onClick={() => setStep(4)} disabled={!formData.debtIncrease} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                    다음
                  </button>
                </div>
              </>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <>
                {renderQuestion(3, "월 실수령 소득", "monthlyIncome", [
                  { value: "under200", label: "200만원 미만" },
                  { value: "200-250", label: "200 ~ 250만원" },
                  { value: "250-300", label: "250 ~ 300만원" },
                  { value: "over300", label: "300만원 이상" },
                ])}
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button type="button" onClick={() => setStep(5)} disabled={!formData.monthlyIncome} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                    다음
                  </button>
                </div>
              </>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <>
                {renderQuestion(4, "압류·독촉 상태", "seizureStatus", [
                  { value: "none", label: "없음" },
                  { value: "collection", label: "독촉만 받고 있음" },
                  { value: "seizure", label: "압류 진행 중" },
                ])}
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(4)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button type="button" onClick={() => setStep(6)} disabled={!formData.seizureStatus} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                    다음
                  </button>
                </div>
              </>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <>
                {renderQuestion(5, "재산 규모", "assets", [
                  { value: "under2k", label: "2천만원 미만" },
                  { value: "2k-5k", label: "2천만원 ~ 5천만원" },
                  { value: "5k-100m", label: "5천만원 ~ 1억" },
                  { value: "over100m", label: "1억 이상" },
                ])}
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(5)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button type="button" onClick={() => setStep(7)} disabled={!formData.assets} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                    다음
                  </button>
                </div>
              </>
            )}

            {/* Step 7 */}
            {step === 7 && (
              <>
                {renderQuestion(6, "채권자 수", "creditors", [
                  { value: "1-5", label: "1 ~ 5곳" },
                  { value: "5-10", label: "5 ~ 10곳" },
                  { value: "over11", label: "11곳 이상" },
                ])}
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(6)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button type="button" onClick={() => setStep(8)} disabled={!formData.creditors} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                    다음
                  </button>
                </div>
              </>
            )}

            {/* Step 8 */}
            {step === 8 && (
              <>
                <div className="space-y-8">
                  {renderQuestion(7, "부양가족 수", "dependents", [
                    { value: "none", label: "없음" },
                    { value: "1", label: "1명" },
                    { value: "2", label: "2명" },
                    { value: "over3", label: "3명 이상" },
                  ])}

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      추가 정보 (선택사항)
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="기타 참고사항을 입력해주세요"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="privacyConsent"
                        checked={privacyConsent}
                        onChange={(e) => setPrivacyConsent(e.target.checked)}
                        className="mt-0.5 mr-3 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        required
                      />
                      <label htmlFor="privacyConsent" className="text-sm text-slate-700">
                        <span className="font-semibold text-rose-600">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                        <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                          입력하신 이름, 연락처 등 개인정보는 상담 목적으로만 사용되며, 서버에 저장되어 관리자가 확인할 수 있습니다.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(7)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-150">
                    이전
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.creditors || !formData.dependents || !privacyConsent}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? "분석 중..." : "결과 확인"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
