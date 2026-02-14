import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            개인 회생파산 자가진단
          </h1>
          <p className="text-lg text-gray-600">
            간단한 정보 입력으로 회생파산 자격요건을 확인해보세요
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            진단 안내
          </h2>
          <ul className="text-blue-800 space-y-2 list-disc list-inside">
            <li>본 진단은 참고용이며, 최종 판단은 전문가 상담이 필요합니다.</li>
            <li>입력하신 정보는 상담 목적으로만 사용됩니다.</li>
            <li>정확한 진단을 위해 성실하게 답변해주시기 바랍니다.</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/diagnosis"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
          >
            자가진단 시작하기
          </Link>
          <Link
            href="/documents"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
          >
            고객서류관리
          </Link>
        </div>
      </div>
    </main>
  );
}
