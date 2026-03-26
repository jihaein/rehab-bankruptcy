"use client";

import { useState } from "react";

export interface ConsentState {
  privacyConsent: boolean;
  sensitiveInfoConsent: boolean;
  overseasTransferConsent: boolean;
  marketingConsent: boolean;
}

interface PrivacyConsentCheckboxProps {
  consent: ConsentState;
  onChange: (consent: ConsentState) => void;
  variant?: "diagnosis" | "documents";
  idPrefix?: string;
  className?: string;
}

const CONSENT_VERSION = "2026-02-18-v1";

const DIAGNOSIS_CONSENT_TEXT = `지산 법무사사무소 웹 자가진단 개인정보 수집·이용 및 국외이전 동의서

1. 개인정보 수집·이용 목적
지산 법무사사무소는 다음의 목적을 위하여 개인정보를 수집·이용합니다.
• 개인회생·파산 가능성 자가진단 결과 제공
• 상담 가능 여부 판단
• 상담 요청 시 연락
※ 본 서비스는 참고용 정보 제공이며, 법률 자문 또는 사건 수임 계약을 의미하지 않습니다.

2. 수집 항목
① 일반 개인정보 (필수)
• 성명, 연락처
• 연령대, 고용 상태, 채무 규모, 월 소득, 재산 현황, 채권자 수, 부양가족 수
※ 주민등록번호, 생년월일 등 고유식별정보는 수집하지 않습니다.

② 민감정보 및 신용정보 (해당 시)
• 채무 내역, 소득 및 자산 관련 정보
※ 민감정보는 진단 결과 제공에 필요한 범위 내에서만 처리됩니다.

3. 개인정보 보유 및 이용기간
• 상담 미진행 시: 수집일로부터 3개월 이내 자동 삭제
• 상담 진행 시: 사건 종료일로부터 5년 보관
보유기간 경과 시 해당 정보는 복구 불가능한 방식으로 즉시 파기됩니다.

4. 개인정보 국외 이전 안내
본 서비스는 Supabase Inc.의 클라우드 서버를 이용합니다.
• 이전 국가: 미국
• 이전받는 자: Supabase Inc.
• 이전 목적: 데이터 저장 및 서버 운영 관리
• 이전 항목: 수집된 개인정보 일체
• 이전 방법: 암호화된 네트워크 전송(SSL)
• 보유·이용기간: 위 보유기간과 동일
• 보호조치: 접근통제, 암호화, 인증 관리 등 기술적·관리적 보호조치 적용

5. 처리 위탁
• 데이터 저장 및 시스템 운영: Supabase Inc.
• 웹사이트 기술 관리: 지산 법무사사무소 내부 관리

6. 파기 방법
• 전자파일: 복구 불가능한 기술적 방법으로 영구 삭제

7. 정보주체의 권리
열람, 정정, 삭제, 처리정지 요구 가능
문의처: 031-388-7771

8. 동의 거부 권리 및 불이익
필수 항목에 대한 동의를 거부할 경우 진단 서비스 이용이 제한될 수 있습니다.`;

const DOCUMENTS_CONSENT_TEXT = `지산 법무사사무소 서류 제출 개인정보 수집·이용 및 국외이전 동의서

1. 개인정보 수집·이용 목적
지산 법무사사무소는 다음의 목적을 위하여 개인정보를 수집·이용합니다.
• 개인회생·파산 상담 및 사건 수임 여부 검토
• 법원 제출 서류 작성 및 절차 진행
• 의뢰인 본인 확인 및 연락
• 사건 진행 관리 및 민원 대응
• 관련 법령에 따른 의무 이행
수집된 개인정보는 위 목적 외로 이용되지 않습니다.

2. 수집 항목
① 일반 개인정보 (필수)
• 성명, 연락처
• 업로드한 서류에 포함된 개인정보 일체

② 고유식별정보 (해당 시)
• 주민등록번호
※ 주민등록번호는 「개인정보 보호법」 제24조 및 관련 법령에 따라 법원 제출 등 법적 절차 수행에 필요한 경우에 한하여 수집·이용됩니다.

③ 민감정보 및 신용정보 (해당 시)
• 채무 내역, 신용정보조회서 내용
• 소득 및 자산 관련 정보
• 건강정보 등 서류에 포함된 민감정보
※ 민감정보는 사건 수행에 필요한 범위 내에서만 처리됩니다.

3. 개인정보 보유 및 이용기간
• 상담 미진행 시: 수집일로부터 3개월 이내 자동 삭제
• 사건 수임 및 진행 시: 사건 종료일로부터 5년 보관 (관계 법령에 따른 보존 의무 이행 목적)
보유기간 경과 시 해당 정보는 복구 불가능한 방식으로 즉시 파기됩니다.

4. 개인정보 국외 이전 안내
본 서비스는 Supabase Inc.의 클라우드 서버를 이용합니다.
• 이전 국가: 미국
• 이전받는 자: Supabase Inc.
• 이전 목적: 데이터 저장 및 서버 운영 관리
• 이전 항목: 수집된 개인정보 일체
• 이전 시점: 서류 제출 시점
• 이전 방법: 암호화된 네트워크 전송(SSL)
• 보유·이용기간: 위 보유기간과 동일
• 보호조치: 접근통제, 암호화, 인증 관리 등 기술적·관리적 보호조치 적용

5. 개인정보 처리 위탁
• 데이터 저장 및 시스템 운영: Supabase Inc.
• 웹사이트 기술 관리: 지산 법무사사무소 내부 관리
위탁업체는 관련 법령에 따라 개인정보를 안전하게 처리하도록 관리·감독합니다.

6. 개인정보 파기 방법
• 전자파일: 복구 불가능한 기술적 방법으로 영구 삭제
• 출력물: 분쇄 또는 소각

7. 정보주체의 권리
열람, 정정, 삭제, 처리정지 요구 가능
문의처: 031-388-7771

8. 동의 거부 권리 및 불이익
필수 항목에 대한 동의를 거부할 경우 서류 제출 및 상담 접수가 제한될 수 있습니다.`;

export { CONSENT_VERSION };

export default function PrivacyConsentCheckbox({
  consent,
  onChange,
  variant = "diagnosis",
  idPrefix = "consent",
  className = "",
}: PrivacyConsentCheckboxProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const consentText = variant === "diagnosis" ? DIAGNOSIS_CONSENT_TEXT : DOCUMENTS_CONSENT_TEXT;
  const requiredAll = consent.privacyConsent && consent.sensitiveInfoConsent && consent.overseasTransferConsent;
  const allChecked = requiredAll && consent.marketingConsent;

  const handleSelectAll = (checked: boolean) => {
    onChange({
      privacyConsent: checked,
      sensitiveInfoConsent: checked,
      overseasTransferConsent: checked,
      marketingConsent: checked,
    });
  };

  return (
    <>
      <div className={`border border-slate-200 rounded-lg overflow-hidden ${className}`}>
        <label
          htmlFor={`${idPrefix}-all`}
          className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 cursor-pointer"
        >
          <input
            type="checkbox"
            id={`${idPrefix}-all`}
            checked={allChecked}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
          />
          <span className="text-sm font-semibold text-slate-800">전체 동의</span>
        </label>

        <div className="px-4 py-2.5 space-y-0.5">
          <label htmlFor={`${idPrefix}-privacy`} className="flex items-center gap-3 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              id={`${idPrefix}-privacy`}
              checked={consent.privacyConsent}
              onChange={(e) => onChange({ ...consent, privacyConsent: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
            />
            <span className="text-xs text-slate-600">
              <span className="text-rose-500 font-medium">(필수)</span> 개인정보 수집·이용에 동의합니다.
            </span>
          </label>

          <label htmlFor={`${idPrefix}-sensitive`} className="flex items-center gap-3 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              id={`${idPrefix}-sensitive`}
              checked={consent.sensitiveInfoConsent}
              onChange={(e) => onChange({ ...consent, sensitiveInfoConsent: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
            />
            <span className="text-xs text-slate-600">
              <span className="text-rose-500 font-medium">(필수)</span> 민감정보 및 고유식별정보 처리에 동의합니다.
            </span>
          </label>

          <label htmlFor={`${idPrefix}-overseas`} className="flex items-center gap-3 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              id={`${idPrefix}-overseas`}
              checked={consent.overseasTransferConsent}
              onChange={(e) => onChange({ ...consent, overseasTransferConsent: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
            />
            <span className="text-xs text-slate-600">
              <span className="text-rose-500 font-medium">(필수)</span> 개인정보 국외 이전에 동의합니다.
            </span>
          </label>

          <label htmlFor={`${idPrefix}-marketing`} className="flex items-center gap-3 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              id={`${idPrefix}-marketing`}
              checked={consent.marketingConsent}
              onChange={(e) => onChange({ ...consent, marketingConsent: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
            />
            <span className="text-xs text-slate-600">
              <span className="text-slate-400 font-medium">(선택)</span> 상담 연락을 위한 전화·문자 수신에 동의합니다.
            </span>
          </label>
        </div>

        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
          >
            개인정보 처리방침 전문 보기 →
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">개인정보 처리방침</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
              {consentText.trim()}
            </div>
            <div className="p-5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
