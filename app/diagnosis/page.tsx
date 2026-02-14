"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DiagnosisForm {
  name: string;
  phone: string;
  ageGroup: string; // "under30", "30-50", "50-65", "over65"
  // 1. 총 채무 규모
  totalDebt: string; // "under5k", "5k-100m", "100m-200m", "over200m"
  // 2. 최근 1년 채무 증가 금액
  debtIncrease: string; // "none", "under2k", "2k-5k", "over5k"
  // 3. 월 실수령 소득
  monthlyIncome: string; // "under200", "200-250", "250-300", "over300"
  // 4. 압류·독촉 상태
  seizureStatus: string; // "none", "collection", "seizure"
  // 5. 재산 규모
  assets: string; // "under2k", "2k-5k", "5k-100m", "over100m"
  // 6. 채권자 수
  creditors: string; // "1-5", "5-10", "over11"
  // 7. 부양가족 수
  dependents: string; // "none", "1", "2", "over3"
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

  if (step === 9 && result) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              진단 결과
            </h1>
          </div>

          <div
            className={`p-6 rounded-lg mb-6 ${
              result.eligible
                ? "bg-green-50 border-l-4 border-green-500"
                : "bg-red-50 border-l-4 border-red-500"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">
              {result.eligible ? "✅ 회생파산 가능" : "❌ 회생파산 제한"}
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">상세 설명:</h3>
                <p className="whitespace-pre-line">{result.explanation}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">권장사항:</h3>
                <p className="whitespace-pre-line">{result.recommendation}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              전문가 상담이 필요하신가요?
            </h3>
            <p className="text-blue-800 mb-4">
              더 정확한 진단과 상세한 상담을 위해 전문 법무사와 직접 상담하시는 것을 권장합니다.
            </p>
            <button
              onClick={handleCall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              📞 전화 상담 예약하기
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:text-blue-800 underline"
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
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {questionNumber}
          </span>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={formData[name as keyof DiagnosisForm] === option.value}
                onChange={() => handleRadioChange(name, option.value)}
                className="mr-3 w-5 h-5 text-blue-600"
                required
              />
              <span className="text-gray-700 font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            회생파산 자가진단
          </h1>
          <p className="text-gray-600 mb-4">
            간단한 질문에 답변해주시면 회생파산 가능 여부를 진단해드립니다.
          </p>
          <div className="mt-4">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded ${
                    s <= step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {step} / 8 단계
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">나이대</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { value: "under30", label: "30대 미만" },
                    { value: "30-50", label: "30~50세" },
                    { value: "50-65", label: "50~65세" },
                    { value: "over65", label: "65세 이상" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name="ageGroup"
                        value={option.value}
                        checked={formData.ageGroup === option.value}
                        onChange={() => handleRadioChange("ageGroup", option.value)}
                        className="mr-3 w-5 h-5 text-blue-600"
                        required
                      />
                      <span className="text-gray-700 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.phone || !formData.ageGroup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 단계
              </button>
            </>
          )}

          {/* Step 2: 총 채무 규모 */}
          {step === 2 && (
            <>
              {renderQuestion(
                1,
                "총 채무 규모",
                "totalDebt",
                [
                  { value: "under5k", label: "5천 미만 (만원)" },
                  { value: "5k-100m", label: "5천~1억 (만원)" },
                  { value: "100m-200m", label: "1억~2억 (만원)" },
                  { value: "over200m", label: "2억 이상 (만원)" },
                ]
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.totalDebt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </>
          )}

          {/* Step 3: 최근 1년 채무 증가 금액 */}
          {step === 3 && (
            <>
              {renderQuestion(
                2,
                "최근 1년 채무 증가 금액",
                "debtIncrease",
                [
                  { value: "none", label: "없음" },
                  { value: "under2k", label: "2천 미만 (만원)" },
                  { value: "2k-5k", label: "2천~5천 (만원)" },
                  { value: "over5k", label: "5천 이상 (만원)" },
                ]
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!formData.debtIncrease}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </>
          )}

          {/* Step 4: 월 실수령 소득 */}
          {step === 4 && (
            <>
              {renderQuestion(
                3,
                "월 실수령 소득",
                "monthlyIncome",
                [
                  { value: "under200", label: "200 미만 (만원)" },
                  { value: "200-250", label: "200~250 (만원)" },
                  { value: "250-300", label: "250~300 (만원)" },
                  { value: "over300", label: "300 이상 (만원)" },
                ]
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={!formData.monthlyIncome}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </>
          )}

          {/* Step 5: 압류·독촉 상태 */}
          {step === 5 && (
            <>
              {renderQuestion(
                4,
                "압류·독촉 상태",
                "seizureStatus",
                [
                  { value: "none", label: "없음" },
                  { value: "collection", label: "독촉만" },
                  { value: "seizure", label: "압류" },
                ]
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  disabled={!formData.seizureStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </>
          )}

          {/* Step 6: 재산 규모 */}
          {step === 6 && (
            <>
              {renderQuestion(
                5,
                "재산 규모",
                "assets",
                [
                  { value: "under2k", label: "2천 미만 (만원)" },
                  { value: "2k-5k", label: "2천~5천 (만원)" },
                  { value: "5k-100m", label: "5천~1억 (만원)" },
                  { value: "over100m", label: "1억 이상 (만원)" },
                ]
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  disabled={!formData.assets}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </>
          )}

          {/* Step 7: 채권자 수 */}
          {step === 7 && (
            <>
              {renderQuestion(
                6,
                "채권자 수",
                "creditors",
                [
                  { value: "1-5", label: "1~5곳" },
                  { value: "5-10", label: "5~10곳" },
                  { value: "over11", label: "11곳 이상" },
                ]
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(8)}
                  disabled={!formData.creditors}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </>
          )}

          {/* Step 8: 부양가족 수 및 추가 정보 */}
          {step === 8 && (
            <>
              <div className="space-y-8">
                {renderQuestion(
                  7,
                  "부양가족 수",
                  "dependents",
                  [
                    { value: "none", label: "없음" },
                    { value: "1", label: "1명" },
                    { value: "2", label: "2명" },
                    { value: "over3", label: "3명 이상" },
                  ]
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 정보 (선택사항)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="기타 참고사항을 입력해주세요"
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="privacyConsent"
                      checked={privacyConsent}
                      onChange={(e) => setPrivacyConsent(e.target.checked)}
                      className="mt-1 mr-3"
                      required
                    />
                    <label htmlFor="privacyConsent" className="text-sm text-gray-700">
                      <span className="font-semibold text-red-600">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                      <br />
                      <span className="text-xs text-gray-600 mt-1 block">
                        입력하신 이름, 연락처 등 개인정보는 상담 목적으로만 사용되며, 서버에 저장되어 관리자가 확인할 수 있습니다.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.creditors || !formData.dependents || !privacyConsent}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "진단 중..." : "진단 제출"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
