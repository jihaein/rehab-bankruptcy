import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            전문 법무사 무료 상담
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            개인회생·파산<br className="md:hidden" /> 무료 진단
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            간단한 질문으로 회생·파산 가능성을 확인하고,<br className="hidden md:block" />
            전문가의 정확한 상담을 받아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              href="/diagnosis"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-8 rounded-lg text-base transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-center"
            >
              무료 진단 시작하기
            </Link>
            <Link
              href="/documents"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-8 rounded-lg text-base transition-all duration-200 border border-slate-600 text-center"
            >
              서류 제출하기
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">무료 자가 진단</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              간단한 질문으로 회생·파산 가능성을 빠르게 확인할 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">안전한 서류 관리</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              암호화된 환경에서 서류를 안전하게 제출하고 관리합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">전문가 직접 상담</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              진단 후 전문 법무사와 직접 상담을 진행할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            안내사항
          </h2>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">·</span>
              <span>본 진단은 참고용이며, 최종 판단은 전문가 상담이 필요합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">·</span>
              <span>입력하신 정보는 상담 목적으로만 사용됩니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">·</span>
              <span>정확한 진단을 위해 성실하게 답변해주시기 바랍니다.</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
