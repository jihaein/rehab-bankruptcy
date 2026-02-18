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
    explanation: string;
    recommendation: string;
  } | null>(null);

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

  // 결과 화면
  if (step === 9 && result) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-8 py-6 text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                무료 진단 결과
              </h1>
            </div>

            <div className="p-8">
              <div
                className={`p-6 rounded-lg mb-6 ${
                  result.eligible
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-rose-50 border border-rose-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    result.eligible ? "bg-emerald-100" : "bg-rose-100"
                  }`}>
                    {result.eligible ? (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <h2 className={`text-xl font-bold ${
                    result.eligible ? "text-emerald-800" : "text-rose-800"
                  }`}>
                    {result.eligible ? "회생·파산 가능성 높음" : "회생·파산 가능성 낮음"}
                  </h2>
                </div>
                <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">분석 결과</h3>
                    <p className="whitespace-pre-line">{result.explanation}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">추천 방향</h3>
                    <p className="whitespace-pre-line">{result.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg mb-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  전문가 상담이 필요하신가요?
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  보다 정확한 판단을 위해 전문 법무사와 직접 상담하시는 것을 권장합니다.
                </p>
                <button
                  onClick={handleCall}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
                >
                  전화 상담 예약하기
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => router.push("/")}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  처음으로 돌아가기
                </button>
              </div>
            </div>
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
