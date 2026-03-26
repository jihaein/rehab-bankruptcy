"use client";

import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[#1a1f2e]/85" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#4f6ef7]/15 via-transparent to-[#1a1f2e]/50" />
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 relative">
          <div className="max-w-xl mx-auto text-center">
            <div className="animate-hero inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[13px] text-slate-400 font-medium">무료 상담 접수 중 · 031-388-7771</span>
            </div>
            <h1 className="animate-hero-delay text-[36px] md:text-[48px] font-extrabold text-white tracking-tight leading-[1.15] mb-5">
              당신의 새 출발,<br />
              <span className="text-[#7b93f7]">지산</span>이 함께합니다
            </h1>
            <p className="animate-hero-delay-2 text-[16px] md:text-[17px] text-slate-400 leading-[1.8] mb-8">
              18년 경력의 개인회생·파산면책 전문<br className="hidden sm:block" />
              지산 법무사사무소가 새로운 시작을 돕겠습니다.
            </p>
            <div className="animate-hero-delay-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/diagnosis"
                className="bg-[#4f6ef7] hover:bg-[#4060e6] text-white text-[15px] font-semibold py-3.5 px-8 rounded-lg transition-colors text-center shadow-lg shadow-[#4f6ef7]/20"
              >
                무료 진단 시작하기
              </Link>
              <Link
                href="/documents"
                className="bg-white/10 hover:bg-white/15 text-white text-[15px] font-medium py-3.5 px-8 rounded-lg transition-colors text-center border border-white/10"
              >
                서류 제출하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Representative */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="md:flex md:items-center md:justify-center md:gap-16 max-w-4xl md:mx-auto">
            <ScrollReveal className="md:w-1/3 flex justify-center mb-10 md:mb-0 shrink-0" direction="left">
              <div className="w-48 h-60 md:w-56 md:h-72 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
                <Image
                  src="/images/representative.png"
                  alt="인태관 대표 법무사"
                  width={224}
                  height={288}
                  className="w-full h-full object-cover object-[center_50%]"
                  priority
                />
              </div>
            </ScrollReveal>
            <ScrollReveal className="md:w-2/3 md:max-w-md" direction="right" delay={100}>
              <p className="text-[12px] font-semibold text-[#4f6ef7] tracking-widest uppercase mb-2">대표 법무사</p>
              <h2 className="text-[30px] font-bold text-slate-900 tracking-tight mb-1">인태관</h2>
              <p className="text-[14px] text-slate-400 mb-7">개인회생 · 파산면책 전문 | 2008년 개업</p>
              <ul className="space-y-2.5 text-[15px] text-slate-600">
                {[
                  "고려대학교 법학과 졸업",
                  "수원지방법원 안양지원 민사조정위원",
                  "경기중앙지방법무사회 제도발전위원",
                  "경기중앙지방법무사회 민사집행법 위원",
                  "등기법학회 정회원",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7]/40 mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 mt-7 text-[14px] font-medium text-[#4f6ef7] hover:text-[#4060e6] transition-colors"
              >
                사무소 자세히 보기
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why Jisan */}
      <section className="bg-[#f8f9fb]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <ScrollReveal className="text-center mb-14">
            <p className="text-[12px] font-semibold text-[#4f6ef7] tracking-widest uppercase mb-2">Why Jisan</p>
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">지산이 다른 이유</h2>
          </ScrollReveal>
          <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-6 sr-stagger">
            {[
              {
                icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "18년의 전문성",
                desc: "2008년 개업 이래 개인회생·파산면책 분야에만 집중해온 전문성으로 의뢰인에게 최적의 해결책을 제시합니다.",
              },
              {
                icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
                title: "대표 법무사 직접 상담",
                desc: "모든 사건을 대표 법무사가 직접 상담하고 처리합니다. 중간 과정 없이 전문가와 1:1로 소통합니다.",
              },
              {
                icon: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
                title: "법원 경험 기반 실무력",
                desc: "수원지방법원 민사조정위원 활동 경험으로 법원의 판단 기준을 깊이 이해하고 사건에 반영합니다.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-7 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-[#4f6ef7]/5 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#4f6ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-[14px] text-slate-500 leading-[1.75]">{item.desc}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <ScrollReveal className="text-center mb-14">
            <p className="text-[12px] font-semibold text-[#4f6ef7] tracking-widest uppercase mb-2">Services</p>
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">이용 안내</h2>
          </ScrollReveal>
          <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-6 sr-stagger">
            <Link href="/diagnosis" className="group rounded-xl border border-slate-100 hover:border-[#4f6ef7]/30 p-7 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#4f6ef7]/5 rounded-lg flex items-center justify-center group-hover:bg-[#4f6ef7]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#4f6ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold text-slate-900">무료 자가 진단</h3>
              </div>
              <p className="text-[14px] text-slate-500 leading-[1.75] mb-4">
                간단한 질문으로 회생·파산 가능성을 확인하고, 개인회생과 파산면책 비교 분석 리포트를 받아보세요.
              </p>
              <span className="text-[13px] font-medium text-[#4f6ef7] group-hover:underline">진단 시작하기 →</span>
            </Link>

            <Link href="/documents" className="group rounded-xl border border-slate-100 hover:border-[#4f6ef7]/30 p-7 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#4f6ef7]/5 rounded-lg flex items-center justify-center group-hover:bg-[#4f6ef7]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#4f6ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold text-slate-900">안전한 서류 제출</h3>
              </div>
              <p className="text-[14px] text-slate-500 leading-[1.75] mb-4">
                암호화된 환경에서 소득증명, 채무증명 등 필요 서류를 안전하게 제출하고 관리합니다.
              </p>
              <span className="text-[13px] font-medium text-[#4f6ef7] group-hover:underline">서류 제출하기 →</span>
            </Link>

            <div className="rounded-xl border border-slate-100 p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#4f6ef7]/5 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#4f6ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold text-slate-900">전문가 직접 상담</h3>
              </div>
              <p className="text-[14px] text-slate-500 leading-[1.75] mb-4">
                18년 경력의 인태관 대표 법무사가 직접 상담합니다. 주말 상담도 전화 예약으로 가능합니다.
              </p>
              <a href="tel:0313887771" className="text-[13px] font-medium text-[#4f6ef7] hover:underline">031-388-7771 →</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#f8f9fb]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <ScrollReveal className="text-center mb-14">
            <p className="text-[12px] font-semibold text-[#4f6ef7] tracking-widest uppercase mb-2">Process</p>
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">상담부터 면책까지</h2>
          </ScrollReveal>
          <ScrollReveal className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 sr-stagger">
            {[
              { step: "01", title: "무료 상담", desc: "전화 또는 방문 상담으로 현재 상황을 파악합니다." },
              { step: "02", title: "자격 검토", desc: "채무·소득·재산을 분석하여 최적의 절차를 안내합니다." },
              { step: "03", title: "서류 준비·신청", desc: "필요 서류를 안내하고 법원 신청까지 대행합니다." },
              { step: "04", title: "인가·면책", desc: "법원 결정까지 전 과정을 관리하고 대리합니다." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm text-center">
                <div className="w-11 h-11 rounded-full bg-[#4f6ef7] text-white text-[14px] font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-slate-400 leading-[1.7]">{item.desc}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <ScrollReveal>
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hero-bg.png')" }}
          />
          <div className="absolute inset-0 bg-[#1a1f2e]/90" />
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-24 relative">
            <div className="max-w-lg mx-auto text-center">
              <h2 className="text-[26px] md:text-[30px] font-bold text-white tracking-tight mb-3">
                채무 문제, 혼자 고민하지 마세요
              </h2>
              <p className="text-[15px] text-slate-400 mb-8 leading-relaxed">
                무료 진단으로 가능성을 확인하거나, 바로 전문가 상담을 받으실 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/diagnosis"
                  className="bg-[#4f6ef7] hover:bg-[#4060e6] text-white text-[15px] font-semibold py-3.5 px-8 rounded-lg transition-colors text-center"
                >
                  무료 진단 시작
                </Link>
                <a
                  href="tel:0313887771"
                  className="bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[15px] font-medium py-3.5 px-8 rounded-lg transition-colors text-center"
                >
                  031-388-7771
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Contact Info */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 mb-3">사무소</h3>
              <p className="text-[14px] text-slate-500 leading-[1.7]">
                지산 법무사사무소<br />
                경기 안양시 동안구 시민대로 267, 214호<br />
                <span className="text-slate-400">(관양동, 아크로팰리스) 14054</span>
              </p>
              <a
                href="https://naver.me/xFLwZlhk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-[#4f6ef7] hover:underline"
              >
                네이버 플레이스에서 보기
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 mb-3">연락처</h3>
              <p className="text-[14px] text-slate-500 leading-[1.7] mb-4">
                <a href="tel:0313887771" className="text-[#4f6ef7] font-medium hover:underline">031-388-7771</a><br />
                평일 09:00 – 18:00<br />
                <span className="text-slate-400">주말·공휴일 전화 예약 상담</span>
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="tel:0313887771"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#4f6ef7] hover:bg-[#4060e6] text-white text-[13px] font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  전화상담으로 예약하기
                </a>
                <a
                  href="https://naver.me/xFLwZlhk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  네이버로 예약하기
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 mb-3">안내</h3>
              <p className="text-[14px] text-slate-400 leading-[1.7]">
                본 사이트의 진단 결과는 참고용이며,<br />
                최종 판단은 전문가 상담이 필요합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f8f9fb] border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[12px] text-slate-400">© 2008–2026 지산 법무사사무소. All rights reserved.</p>
          <p className="text-[12px] text-slate-400">대표 법무사 인태관</p>
        </div>
      </footer>
    </main>
  );
}
